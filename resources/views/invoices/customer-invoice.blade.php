<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">

    <style>
        @page {
            size: A5;
            margin: 14mm 12mm;
        }

        body {
            font-family: Cambria, DejaVu Serif, serif;
            font-size: 10px;
            color: #111827;
            margin: 0;
            background: #ffffff;
        }

        .receipt {
            width: 100%;
        }

        .header {
            background: #111827;
            color: #ffffff;
            padding: 18px 18px 14px;
            border-radius: 10px;
            margin-bottom: 14px;
        }

        .brand {
            font-size: 25px;
            font-weight: bold;
            letter-spacing: 1.8px;
            text-transform: uppercase;
            margin: 0;
        }

        .subtitle {
            font-size: 10px;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: #d1d5db;
            margin-top: 4px;
        }

        .meta-table {
            width: 100%;
            margin-top: 14px;
            border-collapse: collapse;
        }

        .meta-table td {
            border: none;
            padding: 0;
            color: #e5e7eb;
            font-size: 10px;
        }

        .right {
            text-align: right;
        }

        .status-pill {
            display: inline-block;
            background: #d4af37;
            color: #111827;
            padding: 4px 12px;
            border-radius: 30px;
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .section {
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            padding: 11px 12px;
            margin-bottom: 10px;
            background: #fbfbfb;
        }

        .section-title {
            font-size: 10px;
            font-weight: bold;
            letter-spacing: 1.2px;
            text-transform: uppercase;
            color: #111827;
            margin-bottom: 8px;
            padding-bottom: 5px;
            border-bottom: 1px solid #e5e7eb;
        }

        .info-table {
            width: 100%;
            border-collapse: collapse;
        }

        .info-table td {
            border: none;
            padding: 3px 0;
            vertical-align: top;
        }

        .label {
            width: 36%;
            color: #6b7280;
        }

        .value {
            color: #111827;
            font-weight: bold;
        }

        .items {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
            border-radius: 8px;
        }

        .items th {
            background: #f3f4f6;
            color: #374151;
            padding: 8px;
            font-size: 10px;
            text-transform: uppercase;
            border-bottom: 1px solid #d1d5db;
        }

        .items td {
            padding: 9px 8px;
            border-bottom: 1px solid #e5e7eb;
        }

        .amount {
            text-align: right;
            font-weight: bold;
        }

        .summary {
            width: 58%;
            margin-left: auto;
            border-collapse: collapse;
            margin-top: 8px;
            border: 1px solid #111827;
            border-radius: 8px;
        }

        .summary td {
            padding: 9px;
            border: none;
        }

        .summary-label {
            background: #111827;
            color: #ffffff;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .summary-value {
            text-align: right;
            font-size: 15px;
            font-weight: bold;
            color: #111827;
        }

        .gold-line {
            height: 3px;
            background: #d4af37;
            margin: 12px 0;
            border-radius: 10px;
        }

        .footer {
            margin-top: 16px;
            padding-top: 10px;
            border-top: 1px dashed #9ca3af;
            text-align: center;
            color: #6b7280;
            font-size: 10px;
            line-height: 1.5;
        }

        .footer strong {
            color: #111827;
        }
    </style>
</head>

<body>
<div class="receipt">

    <div class="header">
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="border: none; padding: 0;">
                    <h1 class="brand">Terminal Prime</h1>
                    <div class="subtitle">Airport Counter Receipt</div>
                </td>

                <td class="right" style="border: none; padding: 0;">
                    <span class="status-pill">
                        {{ $customer->payment_status }}
                    </span>
                </td>
            </tr>
        </table>

        <table class="meta-table">
            <tr>
                <td>
                    <strong>Receipt No:</strong>
                    {{ $customer->invoice_number }}
                </td>

                <td class="right">
                    <strong>Date:</strong>
                    {{ now('Asia/Colombo')->format('d/m/Y h:i A') }}
                </td>
            </tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">Customer Information</div>

        <table class="info-table">
            <tr>
                <td class="label">Customer Name</td>
                <td class="value">{{ $customer->name }}</td>
            </tr>
            <tr>
                <td class="label">WhatsApp</td>
                <td class="value">{{ $customer->whatsapp_number ?? '-' }}</td>
            </tr>
            <tr>
                <td class="label">Country</td>
                <td class="value">{{ $customer->country ?? '-' }}</td>
            </tr>
            <tr>
                <td class="label">Drop-off Location</td>
                <td class="value">{{ $customer->dropoff_location ?? '-' }}</td>
            </tr>
        </table>
    </div>

    <table class="items">
        <thead>
            <tr>
                <th style="text-align: left;">Service Description</th>
                <th class="right">Amount</th>
            </tr>
        </thead>

        <tbody>
            <tr>
                <td>Airport Counter Service</td>
                <td class="amount">
                    {{ $customer->agent->new_currency ?? $customer->agent->currency }}
                    {{ number_format($customer->paid_amount, 2) }}
                </td>
            </tr>
        </tbody>
    </table>

    <table class="summary">
        <tr>
            <td class="summary-label">Total Paid</td>
            <td class="summary-value">
                {{ $customer->agent->new_currency ?? $customer->agent->currency }}
                {{ number_format($customer->paid_amount, 2) }}
            </td>
        </tr>
    </table>

    <div class="gold-line"></div>

    <div class="section">
        <div class="section-title">Payment Summary</div>

        <table class="info-table">
            <tr>
                <td class="label">Payment Method</td>
                <td class="value">{{ $customer->payment_method }}</td>
            </tr>
            <tr>
                <td class="label">Payment Status</td>
                <td class="value">{{ $customer->payment_status }}</td>
            </tr>
            <tr>
                <td class="label">Paid Amount</td>
                <td class="value">
                    {{ $customer->agent->new_currency ?? $customer->agent->currency }}
                    {{ number_format($customer->paid_amount, 2) }}
                </td>
            </tr>
        </table>
    </div>

    <div class="footer">
        Thank you for choosing <strong>Terminal Prime</strong>.<br>
        This is a computer generated premium receipt.
    </div>

</div>
</body>
</html>