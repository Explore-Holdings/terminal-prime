<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_screen_can_be_rendered(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
    }

    public function test_users_can_authenticate_using_the_login_screen(): void
    {
        $user = User::factory()->create();

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));

        $this->assertDatabaseHas('user_login_logs', [
            'user_id' => $user->id,
        ]);
    }

    public function test_users_can_not_authenticate_with_invalid_password(): void
    {
        $user = User::factory()->create();

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $this->assertGuest();
    }

    public function test_users_can_logout(): void
    {
        $user = User::factory()->create();

        $log = \App\Models\UserLoginLog::create([
            'user_id' => $user->id,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Symfony',
            'login_at' => now(),
        ]);

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $response->assertRedirect('/');

        $this->assertNotNull($log->fresh()->logout_at);
    }

    public function test_user_checkout_success(): void
    {
        $user = User::factory()->create();

        $log = \App\Models\UserLoginLog::create([
            'user_id' => $user->id,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Symfony',
            'login_at' => now(),
        ]);

        $response = $this->actingAs($user)->post('/counter/checkout');

        $this->assertGuest();
        $this->assertNotNull($log->fresh()->logout_at);
        $response->assertRedirect(route('counter.checkout-summary', $log->id));

        $summaryResponse = $this->get(route('counter.checkout-summary', $log->id));
        $summaryResponse->assertStatus(200);
    }

    public function test_manager_reports_page_is_accessible_to_authenticated_user(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/manager-reports');

        $response->assertStatus(200);
    }

    public function test_manager_can_print_and_download_today_trips_report(): void
    {
        $user = User::factory()->create();

        $printResponse = $this->actingAs($user)->get('/manager-reports/trips/print');
        $printResponse->assertStatus(200);

        $pdfResponse = $this->actingAs($user)->get('/manager-reports/trips/pdf');
        $pdfResponse->assertStatus(200);
    }
}
