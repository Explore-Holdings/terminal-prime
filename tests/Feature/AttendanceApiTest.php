<?php

namespace Tests\Feature;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class AttendanceApiTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        config(['services.attendance.api_token' => 'attendance-test-token']);

        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
        });
        DB::table('users')->insert(['id' => 7, 'name' => 'Test Agent']);

        foreach (['agent_attendance', 'counter_staff_attendance'] as $tableName) {
            Schema::create($tableName, function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->date('attendance_date');
                $table->dateTime('check_in_time')->nullable();
                $table->dateTime('check_out_time')->nullable();
                $table->timestamps();
            });

            DB::table($tableName)->insert([
                ['id' => 1, 'user_id' => 7, 'attendance_date' => '2026-11-12',
                    'check_in_time' => '2026-11-12 08:00:00', 'check_out_time' => '2026-11-12 17:00:00',
                    'created_at' => '2026-11-12 08:00:00', 'updated_at' => '2026-11-12 17:00:00'],
                ['id' => 2, 'user_id' => 99, 'attendance_date' => '2026-11-13',
                    'check_in_time' => '2026-11-13 08:00:00', 'check_out_time' => null,
                    'created_at' => '2026-11-13 08:00:00', 'updated_at' => '2026-11-13 08:00:00'],
            ]);
        }
    }

    public function test_token_is_required_and_unconfigured_access_is_denied(): void
    {
        $this->get('/api/attendance')->assertUnauthorized()->assertJson(['message' => 'Unauthenticated.']);
        $this->withToken('wrong-token')->getJson('/api/attendance')->assertUnauthorized();
        config(['services.attendance.api_token' => null]);
        $this->withToken('attendance-test-token')->getJson('/api/attendance')->assertUnauthorized();
    }

    public function test_both_tables_return_requested_fields_and_support_filters(): void
    {
        $response = $this->withToken('attendance-test-token')
            ->getJson('/api/attendance?user_id=7&attendance_date=2026-11-12')->assertOk();

        foreach (['agent_attendance', 'counter_staff_attendance'] as $key) {
            $response->assertJsonPath("$key.total", 1)
                ->assertJsonPath("$key.data.0.user_id", 7)
                ->assertJsonPath("$key.data.0.user_name", 'Test Agent')
                ->assertJsonPath("$key.data.0.attendance_date", '2026-11-12');
            $record = $response->json("$key.data.0");
            $this->assertCount(7, $record);
            foreach (['check_in_time', 'check_out_time', 'created_at', 'updated_at'] as $field) {
                $this->assertNotNull($record[$field]);
                $this->assertSame('2026-11-12', substr($record[$field], 0, 10));
            }
        }
    }

    public function test_pagination_is_independent_and_missing_users_and_checkout_are_preserved(): void
    {
        $response = $this->withToken('attendance-test-token')
            ->getJson('/api/attendance?per_page=1&agent_page=2')->assertOk();
        $response->assertJsonPath('agent_attendance.current_page', 2)
            ->assertJsonPath('agent_attendance.data.0.user_name', 'Test Agent')
            ->assertJsonPath('counter_staff_attendance.current_page', 1)
            ->assertJsonPath('counter_staff_attendance.data.0.user_id', 99)
            ->assertJsonPath('counter_staff_attendance.data.0.user_name', null)
            ->assertJsonPath('counter_staff_attendance.data.0.check_out_time', null);
        $this->assertStringContainsString('per_page=1', $response->json('agent_attendance.prev_page_url'));
    }

    public function test_invalid_filters_return_json_validation_errors(): void
    {
        $this->withToken('attendance-test-token')->get('/api/attendance?user_id=0&attendance_date=2026-02-30&per_page=101&agent_page=0&staff_page=abc')
            ->assertUnprocessable()->assertJsonValidationErrors([
                'user_id', 'attendance_date', 'per_page', 'agent_page', 'staff_page',
            ]);
    }

    public function test_no_matches_returns_empty_paginated_results(): void
    {
        $this->withToken('attendance-test-token')->getJson('/api/attendance?user_id=123')
            ->assertOk()->assertJsonPath('agent_attendance.data', [])
            ->assertJsonPath('counter_staff_attendance.data', []);
    }
}
