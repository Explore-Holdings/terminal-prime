# Attendance API

`GET /api/attendance` returns attendance from both existing tables. No database migrations are required.

Configure `ATTENDANCE_API_TOKEN` in the deployed application's `.env` with a long random secret, then run `php artisan config:cache`. For example, generate a secret with `php -r "echo bin2hex(random_bytes(32)), PHP_EOL;"`. Keep this token on the calling application's server.

Send these headers:

```http
Authorization: Bearer YOUR_ATTENDANCE_API_TOKEN
Accept: application/json
```

Example request (replace the base URL with the Laravel application's URL):

```bash
curl "https://your-app.example/api/attendance?attendance_date=2026-11-13&user_id=7" \
  -H "Authorization: Bearer YOUR_ATTENDANCE_API_TOKEN" \
  -H "Accept: application/json"
```

Optional query parameters:

| Parameter | Meaning |
| --- | --- |
| `user_id` | Positive user ID; filters both tables. |
| `attendance_date` | Exact date in `YYYY-MM-DD`; filters both tables. |
| `per_page` | Records per table, default 50, maximum 100. |
| `agent_page` | Agent results page, default 1. |
| `staff_page` | Counter staff results page, default 1. |

The response has two keys: `agent_attendance` and `counter_staff_attendance`. Each contains Laravel pagination metadata (`current_page`, `last_page`, `total`, `next_page_url`, etc.) and a `data` array. Follow each table's `next_page_url` independently to retrieve all records. Results are newest attendance first.

Each record in either array has the same fields:

```json
{
  "user_id": 7,
  "user_name": "Example User",
  "attendance_date": "2026-11-13",
  "check_in_time": "2026-11-13T08:00:00+00:00",
  "check_out_time": null,
  "created_at": "2026-11-13T08:00:00+00:00",
  "updated_at": "2026-11-13T08:00:00+00:00"
}
```

Timestamps use ISO 8601 with the application's configured timezone offset. A missing checkout or timestamp is `null`; a missing related user produces `user_name: null` while preserving attendance. Empty results have `data: []`. Missing/incorrect tokens (including an unconfigured server token) return HTTP 401; invalid filters return HTTP 422 JSON validation errors.
