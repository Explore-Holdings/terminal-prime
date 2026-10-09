<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">

    <style>
        @page {
            size: A5;
            margin: 10mm 10mm 12mm 10mm;
        }

        body {
            font-family: 'Cambria';
            font-size: 10px;
            color: #000000ff;
            margin: 0;
            background: #ffffff;
        }

        /* ── Header ── */
        .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        .header-table td {
            border: none;
            padding: 0;
            vertical-align: top;
        }

        .invoice-title {
            font-size: 18px;
            font-weight: bold;
            color: #00703c;
            text-align: right;
            margin: 0 0 6px 0;
        }

        .invoice-meta-table {
            float: right;
            border-collapse: collapse;
        }

        .invoice-meta-table td {
            border: none;
            padding: 1px 0;
            font-size: 10px;
        }

        .invoice-meta-table td:first-child {
            color: #000000ff;
            font-weight: bold;
            padding-right: 12px;
            text-align: right;
        }

        .invoice-meta-table td:last-child {
            color: #000000ff;
            font-weight: bold;
        }

        /* ── Address Block ── */
        .address-block {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 18px;
        }

        .address-block td {
            border: none;
            padding: 0;
            vertical-align: top;
            font-size: 10px;
            line-height: 1.5;
        }

        .address-from {
            color: #000000ff;
        }

        .address-to {
            border: 1px solid #d1d5db;
            padding: 10px 14px;
            background: #f9fafb;
        }

        /* ── Section Title ── */
        .section-heading {
            font-size: 14px;
            font-weight: bold;
            color: #00703c;
            margin: 16px 0 6px 0;
            padding: 0;
        }

        /* ── Info Tables ── */
        .info-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #d1d5db;
            margin-bottom: 4px;
        }

        .info-table td {
            border: none;
            padding: 4px 8px;
            font-size: 10px;
            vertical-align: top;
        }

        .info-label {
            font-weight: bold;
            color: #000000ff;
            width: 28%;
        }

        .info-value {
            color: #000000ff;
        }

        /* ── Charges Table ── */
        .charges-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 4px;
        }

        .charges-table th {
            background: #00703c;
            color: #ffffff;
            padding: 6px 8px;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            text-align: left;
            border: 1px solid #00703c;
        }

        .charges-table th.text-right {
            text-align: right;
        }

        .charges-table td {
            padding: 5px 8px;
            border: 1px solid #e5e7eb;
            font-size: 10px;
        }

        .charges-table .category-row td {
            font-weight: bold;
            background: #f9fafb;
        }

        .charges-table .total-row td {
            font-weight: bold;
            background: #f3f4f6;
            border-top: 2px solid #00703c;
        }

        .text-right {
            text-align: right;
        }

        /* ── Payment Section ── */
        .payment-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #d1d5db;
            margin-bottom: 4px;
        }

        .payment-table td {
            border: none;
            padding: 5px 8px;
            font-size: 10px;
        }

        .payment-table .total-due td {
            font-weight: bold;
            font-size: 11px;
            border-top: 1px solid #d1d5db;
        }

        /* ── Signature ── */
        .signature-block {
            margin-top: 30px;
            text-align: right;
            padding-right: 20px;
        }

        /* ── Footer ── */
        .footer-section {
            margin-top: 40px;
            border-top: 3px solid #00703c;
            padding-top: 12px;
        }

        .footer-table {
            width: 100%;
            border-collapse: collapse;
        }

        .footer-table td {
            border: none;
            padding: 0;
            vertical-align: top;
            font-size: 8px;
            color: #000000ff;
            line-height: 1.5;
        }
    </style>
</head>

<body>
    {{-- ── HEADER: Logo + Invoice Meta ── --}}
    <table class="header-table">
        <tr>
            <td style="width: 50%;">
                @php
                    $logoPath = public_path('assets/images/logo-europcar.png');
                    $logoSrc = file_exists($logoPath)
                        ? 'data:image/png;base64,' . base64_encode(file_get_contents($logoPath))
                        : asset('assets/images/logo-europcar.png');
                @endphp
                <img src="{{ $logoSrc }}" style="height: 50px; width: auto; display: block;" alt="Europcar Logo">
            </td>
            <td style="width: 50%;">
                <!-- <div class="invoice-title">This is your invoice</div> -->
                <table class="invoice-meta-table">
                    <tr>
                        <td>Invoice/Receipt</td>
                        <td>{{ $customer->invoice_number }}</td>
                    </tr>
                    <tr>
                        <td>Date</td>
                        <td>{{ now('Asia/Colombo')->format('d.m.Y') }}</td>
                    </tr>
                    <tr>
                        <td>Customer ID</td>
                        <td>{{ str_pad($customer->id, 8, '0', STR_PAD_LEFT) }}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    {{-- ── ADDRESS BLOCK ── --}}
    <table class="address-block">
        <tr>
            <td style="width: 50%; padding-right: 20px;">
                <div class="address-from">
                    Services provided by:<br>
                    <strong>EUROPCAR - AIRPORT COUNTER</strong><br>
                    Bandaranaike International Airport<br>
                    Katunayake, Sri Lanka<br>
                    Hotline: +94 71 874 1444
                </div>
            </td>
            <td style="width: 50%;">
                <div class="address-to">
                    <strong>{{ strtoupper($customer->name) }}</strong><br>
                    @if($customer->country)
                        {{ $customer->country }}<br>
                    @endif
                    @if($customer->whatsapp_number)
                        Tel: {{ $customer->whatsapp_number }}
                    @endif
                </div>
            </td>
        </tr>
    </table>


    @php
        $agent = $customer->agent;
        $bookingType = strtolower(trim($agent->booking_type ?? ''));
        $isTour = $agent && ($bookingType === 'tour' || $bookingType === 'tours' || !empty($agent->tour_destinations) || !empty($agent->days));
        $tourDestinations = '';
        if ($agent && !empty($agent->tour_destinations)) {
            $rawDest = $agent->tour_destinations;
            if (is_array($rawDest)) {
                $tourDestinations = implode(' → ', array_filter($rawDest));
            } elseif (is_string($rawDest)) {
                $trimmed = trim($rawDest);
                if ((str_starts_with($trimmed, '[') && str_ends_with($trimmed, ']')) || (str_starts_with($trimmed, '{') && str_ends_with($trimmed, '}'))) {
                    $decoded = json_decode($trimmed, true);
                    if (is_array($decoded)) {
                        $tourDestinations = implode(' → ', array_filter($decoded));
                    } else {
                        $tourDestinations = $trimmed;
                    }
                } else {
                    $tourDestinations = $trimmed;
                }
            }
        }
        if ($isTour && empty($tourDestinations)) {
            $tourDestinations = $customer->dropoff_location ?: ($agent->dropoff_location ?: '');
        }
    @endphp

    {{-- ── YOUR RENTAL / TOUR ── --}}
    <div class="section-heading">{{ $isTour ? 'Your Tour Booking' : 'Your Rental' }}</div>
    <table class="info-table">
        @if($isTour)
            <tr>
                <td class="info-label">Counter Station</td>
                <td class="info-value">BIA AIRPORT COUNTER</td>
                <td class="info-label">Booking Type</td>
                <td class="info-value"><strong style="color: #00703c;">TOUR PACKAGE</strong></td>
            </tr>
            <tr>
                <td class="info-label">Tour Destinations</td>
                <td class="info-value" colspan="3" style="font-weight: bold; font-size: 10.5px;">
                    {{ strtoupper($tourDestinations ?: '-') }}
                </td>
            </tr>
            <tr>
                <td class="info-label">Service Date</td>
                <td class="info-value">{{ $customer->created_at ? $customer->created_at->format('d.m.Y H:i') : now('Asia/Colombo')->format('d.m.Y H:i') }}</td>
                <td class="info-label">Payment Method</td>
                <td class="info-value">{{ strtoupper($customer->payment_method ?? '-') }}</td>
            </tr>
            @if(!empty($agent->days))
            <tr>
                <td class="info-label">Duration</td>
                <td class="info-value" colspan="3">{{ $agent->days }} {{ $agent->days == 1 ? 'Day' : 'Days' }}</td>
            </tr>
            @endif
        @else
            <tr>
                <td class="info-label">Counter Station</td>
                <td class="info-value">BIA AIRPORT COUNTER</td>
                <td class="info-label">Drop-off Location</td>
                <td class="info-value">{{ strtoupper($customer->dropoff_location ?? '-') }}</td>
            </tr>
            <tr>
                <td class="info-label">Service Date</td>
                <td class="info-value">{{ $customer->created_at ? $customer->created_at->format('d.m.Y H:i') : now('Asia/Colombo')->format('d.m.Y H:i') }}</td>
                <td class="info-label">Payment Method</td>
                <td class="info-value">{{ strtoupper($customer->payment_method ?? '-') }}</td>
            </tr>
        @endif
    </table>

    {{-- ── YOUR COSTS ── --}}
    <div class="section-heading">Your Costs</div>
    <table class="charges-table">
        <thead>
            <tr>
                <th style="width: 40%;">Charges</th>
                <!-- <th class="text-right">Qty</th> -->
                <!-- <th class="text-right">Unit</th> -->
                <th class="text-right">Price {{ $customer->agent->new_currency ?? $customer->agent->currency ?? '' }}</th>
                <th class="text-right">Amount {{ $customer->agent->new_currency ?? $customer->agent->currency ?? '' }}</th>
            </tr>
        </thead>
        <tbody>
            <tr class="category-row">
                <td colspan="3">{{ $isTour ? 'Tour Package Service' : 'Airport Counter Service' }}</td>
            </tr>
            <tr>
                <td style="padding-left: 16px;">
                    @if($isTour)
                        Tour Package Service
                        @if(!empty($agent->days))
                            - {{ $agent->days }} {{ $agent->days == 1 ? 'Day' : 'Days' }}
                        @endif
                    @else
                        Airport Transfer Service
                    @endif
                </td>
                <!-- <td class="text-right">1</td> -->
                <!-- <td class="text-right">Service</td> -->
                <td class="text-right">{{ number_format($price, 2) }}</td>
                <td class="text-right">{{ number_format($price, 2) }}</td>
            </tr>
            <tr class="total-row">
                <td colspan="1"><strong>Total Charges:</strong></td>
                <td class="text-right">
                    {{ $customer->agent->new_currency ?? $customer->agent->currency ?? '' }}
                    {{ number_format($price, 2) }}
                </td>
                <td class="text-right">
                    <strong>{{ $customer->agent->new_currency ?? $customer->agent->currency ?? '' }}
                    {{ number_format($price, 2) }}</strong>
                </td>
            </tr>
        </tbody>
    </table>

    {{-- ── YOUR PAYMENT ── --}}
    <div class="section-heading">Your Payment</div>
    <table class="payment-table">
        <tr>
            <td class="info-label" style="width: 40%;">Invoice Total</td>
            <td class="text-right">
                {{ $customer->agent->new_currency ?? $customer->agent->currency ?? '' }}
                {{ number_format($price, 2) }}
            </td>
        </tr>
        <tr>
            <td class="info-label">Payment {{ $customer->payment_method ?? '' }}</td>
            <td class="text-right">
                -{{ $customer->agent->new_currency ?? $customer->agent->currency ?? '' }}
                {{ number_format($customer->paid_amount, 2) }}
            </td>
        </tr>
        @if(isset($returnedLkr) && $returnedLkr > 0)
        <tr>
            <td class="info-label">Change Returned</td>
            <td class="text-right">
                LKR {{ number_format($returnedLkr, 2) }}
            </td>
        </tr>
        @endif
        <tr class="total-due">
            <td>Amount Due</td>
            <td class="text-right">
                @php
                    $due = max(0, $price - $customer->paid_amount);
                @endphp
                {{ $customer->agent->new_currency ?? $customer->agent->currency ?? '' }}
                {{ number_format($due, 2) }}
            </td>
        </tr>

        <tr>
            <td class="info-label">Payment Status</td>
            <td class="text-right">
                <span style="background: {{ $customer->payment_status === 'Paid' ? '#dcfce7' : '#fef9c3' }}; color: {{ $customer->payment_status === 'Paid' ? '#166534' : '#854d0e' }}; padding: 2px 10px; border-radius: 10px; font-weight: bold; font-size: 9px; text-transform: uppercase;">
                    {{ $customer->payment_status }}
                </span>
            </td>
        </tr>
    </table>

    {{-- ── SIGNATURE ── --}}
    <div class="signature-block" style="margin-top: 15px;">
        @if(auth()->check())
            @if(auth()->user()->signature && file_exists(storage_path('app/public/' . auth()->user()->signature)))
                <img src="{{ storage_path('app/public/' . auth()->user()->signature) }}" style="height: 50px; object-fit: contain; margin-bottom: 5px;">
                <br>
            @endif
            <strong style="color: #333; font-size: 12px;">{{ auth()->user()->name }}</strong><br>
            @if(auth()->user()->designation)
                <span style="color: #666; font-size: 10px;">{{ auth()->user()->designation }}</span>
            @endif
        @endif
    </div>

    {{-- ── FOOTER ── --}}
    <div class="footer-section" style="margin-top: 15px;">
        <table class="footer-table">
            <tr>
                <td style="width: 40%;">
                    <strong style="color: #1f2937;">EUROPCAR - AIRPORT COUNTER</strong><br>
                    Bandaranaike International Airport<br>
                    Katunayake, Sri Lanka
                </td>
                <td style="width: 30%;">
                    Generated: {{ now('Asia/Colombo')->format('d.m.Y H:i') }}<br>
                    This is a computer generated invoice.
                </td>
                <td style="width: 30%; text-align: right;">
                    Your feedback really counts. Thank you<br>
                    for choosing Europcar - Airport Counter.
                </td>
            </tr>
        </table>
    </div>

</body>
</html>