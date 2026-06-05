<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; }
        .header { text-align: center; margin-bottom: 20px; }
        .box { border: 1px solid #ddd; padding: 12px; margin-bottom: 12px; }
        table { width: 100%; border-collapse: collapse; }
        td, th { border: 1px solid #ddd; padding: 8px; }
        th { background: #f3f4f6; }
        .right { text-align: right; }
    </style>
</head>
<body>

<div class="header">
    <h2>Airport Counter Invoice</h2>
    <p>Invoice No: {{ $customer->invoice_number }}</p>
</div>

<div class="box">
    <strong>Customer:</strong> {{ $customer->name }}<br>
    <strong>WhatsApp:</strong> {{ $customer->whatsapp_number ?? '-' }}<br>
    <strong>Country:</strong> {{ $customer->country ?? '-' }}<br>
    <strong>Drop-off:</strong> {{ $customer->dropoff_location ?? '-' }}
</div>

<table>
    <tr>
        <th>Description</th>
        <th class="right">Amount</th>
    </tr>
    <tr>
        <td>Airport Counter Service</td>
        <td class="right">
            {{ $customer->agent->new_currency ?? $customer->agent->currency }}
            {{ number_format($customer->paid_amount, 2) }}
        </td>
    </tr>
</table>

<br>

<div class="box">
    <strong>Payment Method:</strong> {{ $customer->payment_method }}<br>
    <strong>Status:</strong> {{ $customer->payment_status }}<br>
    <strong>Paid Amount:</strong> {{ number_format($customer->paid_amount, 2) }}
</div>

</body>
</html>