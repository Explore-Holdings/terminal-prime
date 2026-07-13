<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Today's Trips Report</title>
    <style>
        @page {
            size: A4;
            margin: 15mm 15mm;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 11px;
            color: #1f2937;
            margin: 0;
            background: #ffffff;
        }
        .header {
            margin-bottom: 20px;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 10px;
        }
        .title {
            font-size: 20px;
            font-weight: bold;
            color: #1e3a8a;
            margin: 0;
        }
        .subtitle {
            font-size: 11px;
            color: #6b7280;
            margin-top: 5px;
        }
        .meta-section {
            width: 100%;
            margin-bottom: 20px;
        }
        .meta-table {
            width: 100%;
            border-collapse: collapse;
        }
        .meta-table td {
            padding: 5px 0;
            font-size: 11px;
        }
        .meta-label {
            color: #4b5563;
            font-weight: bold;
            width: 25%;
        }
        .meta-value {
            color: #1f2937;
        }
        .trips-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        .trips-table th {
            background-color: #f3f4f6;
            color: #374151;
            font-weight: bold;
            text-align: left;
            padding: 8px 10px;
            font-size: 10px;
            text-transform: uppercase;
            border-bottom: 1px solid #d1d5db;
        }
        .trips-table td {
            padding: 8px 10px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 11px;
        }
        .text-right {
            text-align: right;
        }
        .totals-section {
            margin-top: 20px;
            float: right;
            width: 40%;
        }
        .totals-table {
            width: 100%;
            border-collapse: collapse;
        }
        .totals-table td {
            padding: 5px 10px;
            font-size: 11px;
        }
        .totals-label {
            font-weight: bold;
            color: #4b5563;
        }
        .totals-value {
            font-weight: bold;
            color: #111827;
            font-size: 13px;
        }
        .footer {
            margin-top: 50px;
            border-top: 1px solid #e5e7eb;
            padding-top: 10px;
            text-align: center;
            color: #9ca3af;
            font-size: 9px;
            position: absolute;
            bottom: 0;
            width: 100%;
        }
    </style>
    @if($is_print)
        <script>
            window.onload = function() {
                window.print();
            }
        </script>
    @endif
</head>
<body>
    <div class="header">
        <div class="title">{{ strtoupper($title ?? "Today's Trips Report") }}</div>
        <div class="subtitle">Terminal Prime Management System</div>
    </div>

    <div class="meta-section">
        <table class="meta-table">
            <tr>
                <td class="meta-label">Report Date:</td>
                <td class="meta-value">{{ $date }}</td>
                <td class="meta-label">Generated:</td>
                <td class="meta-value">{{ now()->format('M d, Y h:i A') }}</td>
            </tr>
        </table>
    </div>

    <table class="trips-table">
        <thead>
            <tr>
                <th>Time</th>
                <th>Customer</th>
                <th>Driver</th>
                <th>Vehicle / Reg No</th>
                <th>Dropoff Location</th>
                <th class="text-right">Amount</th>
            </tr>
        </thead>
        <tbody>
            @forelse($trips as $trip)
                <tr>
                    <td>{{ $trip->trip_assigned_at ? \Carbon\Carbon::parse($trip->trip_assigned_at)->format('h:i A') : ($trip->created_at ? $trip->created_at->format('h:i A') : '-') }}</td>
                    <td>
                        {{ $trip->customer?->name ?? 'Guest' }}<br>
                        <small style="color: #6b7280;">{{ $trip->customer?->customer_code }}</small>
                    </td>
                    <td>
                        {{ $trip->driver?->first_name }} {{ $trip->driver?->last_name }}<br>
                        <small style="color: #6b7280;">{{ $trip->driver?->mobile_number }}</small>
                    </td>
                    <td>
                        {{ $trip->driver?->vehicle?->registration_number ?? '-' }}<br>
                        <small style="color: #6b7280;">{{ $trip->driver?->vehicle?->vehicle_type ?? '' }}</small>
                    </td>
                    <td>{{ $trip->customer?->dropoff_location ?? '-' }}</td>
                    <td class="text-right">LKR {{ number_format($trip->tripFinance?->total_amount ?? 0) }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="6" style="text-align: center; color: #9ca3af; padding: 20px;">
                        No trips assigned today.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="totals-section">
        <table class="totals-table">
            <tr>
                <td class="totals-label">Total Trips:</td>
                <td class="text-right">{{ count($trips) }}</td>
            </tr>
            <tr>
                <td class="totals-label">Total Revenue:</td>
                <td class="totals-value text-right">LKR {{ number_format($trips->sum(fn($t) => $t->tripFinance?->total_amount ?? 0)) }}</td>
            </tr>
        </table>
    </div>

    <div style="clear: both; margin-top: 60px;">
        <table style="width: 100%; border-collapse: collapse; margin-top: 40px;">
            <tr>
                <td style="width: 45%; border-top: 1px dashed #9ca3af; text-align: center; padding-top: 8px; font-size: 11px; color: #4b5563;">
                    <strong>Manager Signature</strong><br>
                    <span style="font-size: 9px; color: #9ca3af;">Date: .........................</span>
                </td>
                <td style="width: 10%;"></td>
                <td style="width: 45%; border-top: 1px dashed #9ca3af; text-align: center; padding-top: 8px; font-size: 11px; color: #4b5563;">
                    <strong>Finance Officer Signature</strong><br>
                    <span style="font-size: 9px; color: #9ca3af;">Date: .........................</span>
                </td>
            </tr>
        </table>
    </div>

    <div class="footer">
        Generated | Terminal Prime Management System
    </div>
</body>
</html>
