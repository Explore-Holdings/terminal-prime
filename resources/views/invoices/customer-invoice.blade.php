<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">

    <style>
        @page {
            size: A5;
            margin: 18mm 14mm;
        }

        body {
            font-family: Cambria, DejaVu Serif, serif;
            font-size: 10px;
            color: #1f2937;
            margin: 0;
        }

        .receipt {
            width: 100%;
        }

        .top-bar {
            border-bottom: 3px solid #111827;
            padding-bottom: 10px;
            margin-bottom: 18px;
        }

        .business-name {
            font-size: 26px;
            font-weight: bold;
            letter-spacing: 1px;
            text-transform: uppercase;
            color: #111827;
            margin: 0;
        }

        .receipt-title {
            font-size: 13px;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: #6b7280;
            margin-top: 4px;
        }

        .meta {
            margin-top: 12px;
            width: 100%;
        }

        .meta td {
            border: none;
            padding: 2px 0;
            font-size: 11px;
        }

        .meta .right {
            text-align: right;
        }

        .section {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 12px;
            background: #fafafa;
        }

        .section-title {
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            color: #111827;
            margin-bottom: 8px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
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
            color: #6b7280;
            width: 35%;
        }

        .value {
            font-weight: bold;
            color: #111827;
        }

        .items {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
            margin-bottom: 14px;
        }

        .items th {
            background: #111827;
            color: #ffffff;
            padding: 9px 8px;
            font-size: 11px;
            text-transform: uppercase;
            border: 1px solid #111827;
        }

        .items td {
            padding: 10px 8px;
            border: 1px solid #e5e7eb;
        }

        .items .right {
            text-align: right;
        }

        .total-box {
            width: 55%;
            margin-left: auto;
            border: 1px solid #111827;
            margin-top: 8px;
        }

        .total-box td {
            border: none;
            padding: 8px;
        }

        .total-label {
            background: #111827;
            color: #ffffff;
            font-weight: bold;
            text-transform: uppercase;
        }

        .total-value {
            text-align: right;
            font-size: 16px;
            font-weight: bold;
        }

        .payment-status {
            display: inline-block;
            padding: 4px 10px;
            background: #dcfce7;
            color: #166534;
            border-radius: 20px;
            font-weight: bold;
            font-size: 11px;
            text-transform: uppercase;
        }

        .footer {
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px dashed #9ca3af;
            text-align: center;
            color: #6b7280;
            font-size: 11px;
        }

        .signature-row {
            margin-top: 28px;
            width: 100%;
        }

        .signature-row td {
            border: none;
            text-align: center;
            font-size: 11px;
            color: #374151;
        }

        .signature-line {
            border-top: 1px solid #6b7280;
            padding-top: 5px;
            width: 150px;
            margin: 0 auto;
        }
    </style>
</head>

<body>
<div class="receipt">

    <div class="top-bar">
        <h1 class="business-name">Terminal Prime</h1>
        <div class="receipt-title">Cash Receipt</div>

        <table class="meta">
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
        <div class="section-title">Customer Details</div>

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
                <td class="label">Drop-off</td>
                <td class="value">{{ $customer->dropoff_location ?? '-' }}</td>
            </tr>
        </table>
    </div>

    <table class="items">
        <thead>
            <tr>
                <th>Description</th>
                <th class="right">Amount</th>
            </tr>
        </thead>

        <tbody>
            <tr>
                <td>Airport Counter Service</td>
                <td class="right">
                    {{ $customer->agent->new_currency ?? $customer->agent->currency }}
                    {{ number_format($customer->paid_amount, 2) }}
                </td>
            </tr>
        </tbody>
    </table>

    <table class="total-box">
        <tr>
            <td class="total-label">Total Paid</td>
            <td class="total-value">
                {{ $customer->agent->new_currency ?? $customer->agent->currency }}
                {{ number_format($customer->paid_amount, 2) }}
            </td>
        </tr>
    </table>

    <div class="section" style="margin-top: 14px;">
        <div class="section-title">Payment Details</div>

        <table class="info-table">
            <tr>
                <td class="label">Payment Method</td>
                <td class="value">{{ $customer->payment_method }}</td>
            </tr>
            <tr>
                <td class="label">Payment Status</td>
                <td>
                    <span class="payment-status">
                        {{ $customer->payment_status }}
                    </span>
                </td>
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

    <!-- <table class="signature-row">
        <tr>
            <td>
                <div class="signature-line">Authorized Signature</div>
            </td>
            <td>
                <div class="signature-line">Customer Signature</div>
            </td>
        </tr>
    </table> -->

    <div class="footer">
        Thank you for choosing Terminal Prime.<br>
        This is a computer generated receipt.
    </div>

</div>
</body>
</html>