<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">

    <style>
        @page {
            size: A5;
            margin: 7mm 8mm 8mm 8mm;
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
            margin-bottom: 12px;
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
            margin-bottom: 10px;
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
            padding: 8px 12px;
            background: #f9fafb;
        }

        /* ── Section Title ── */
        .section-heading {
            font-size: 13px;
            font-weight: bold;
            color: #00703c;
            margin: 10px 0 4px 0;
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
            margin-top: 16px;
            text-align: right;
            padding-right: 20px;
        }

        /* ── Footer ── */
        .footer-section {
            margin-top: 16px;
            border-top: 3px solid #00703c;
            padding-top: 8px;
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
                <table class="invoice-meta-table">
                    <tr>
                        <td>Invoice/Receipt</td>
                        <td>{{ $invoiceNumber }}</td>
                    </tr>
                    <tr>
                        <td>Date</td>
                        <td>{{ now('Asia/Colombo')->format('d.m.Y') }}</td>
                    </tr>
                    <tr>
                        <td>Trip Ref</td>
                        <td>#{{ $tripNumber }}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    {{-- ── ADDRESS BLOCK (No Customer Details) ── --}}
    <table class="address-block">
        <tr>
            <td style="width: 50%; padding-right: 20px;">
                <div class="address-from">
                    Services provided by:<br>
                    <strong>EUROPCAR - AIRPORT COUNTER</strong><br>
                    Bandaranaike International Airport<br>
                    Katunayake, Sri Lanka<br>
                    <strong>Hotline (24/7) : <a href="tel:+94718741444" style="color: black; text-decoration: none;">+94 71 874 1444</a></strong>
                </div>
            </td>
            <td style="width: 50%;">
                <div class="address-to">
                    <strong>DRIVER TRIP DISPATCH</strong><br>
                    Booking Type: <strong style="color: #00703c;">{{ strtoupper($bookingType) }}</strong><br>
                    Dispatch Station: BIA Airport Counter<br>
                    Fleet Type: {{ $isOutsource ? 'Outsource / Outside Vehicle' : 'Europcar Fleet Vehicle' }}
                </div>
            </td>
        </tr>
    </table>

    {{-- ── VEHICLE & TRIP DETAILS (No Payment Method) ── --}}
    <div class="section-heading">{{ $isTour ? 'Tour & Vehicle Details' : 'Transfer & Vehicle Details' }}</div>
    <table class="info-table">
        <tr>
            <td class="info-label">Counter Station</td>
            <td class="info-value">BIA AIRPORT COUNTER</td>
            <td class="info-label">Booking Type</td>
            <td class="info-value"><strong style="color: #00703c;">{{ strtoupper($bookingType) }}</strong></td>
        </tr>

        @if($isTour)
            <tr>
                <td class="info-label">Tour Destinations</td>
                <td class="info-value" colspan="3" style="font-weight: bold; font-size: 10.5px;">
                    {{ strtoupper($tourDestinations ?: '-') }}
                </td>
            </tr>
        @else
            <tr>
                <td class="info-label">Drop-off Location</td>
                <td class="info-value" colspan="3" style="font-weight: bold; font-size: 10.5px;">
                    {{ strtoupper($dropoffLocation ?: '-') }}
                </td>
            </tr>
        @endif

        @if($isTour && !in_array(strtolower(trim($bookingType)), ['transfer', 'transfers']))
        <tr>
            <td class="info-label">Arrival Date</td>
            <td class="info-value">{{ $arrivalDate?->format('d.m.Y') ?? '-' }}</td>
            <td class="info-label">Departure Date</td>
            <td class="info-value">{{ $departureDate?->format('d.m.Y') ?? '-' }}</td>
        </tr>
        @endif

        <tr>
            <td class="info-label">Vehicle Number</td>
            <td class="info-value">
                <strong style="font-size: 11px;">{{ strtoupper($vehicleReg ?: '-') }}</strong>
                @if($isOutsource)
                    <span style="color: #b45309; font-weight: bold; font-size: 9px;">(Outside Vehicle)</span>
                @endif
            </td>
            <td class="info-label">Vehicle Model</td>
            <td class="info-value">{{ strtoupper($vehicleModel ?: ($isOutsource ? 'Outside Fleet' : '-')) }}</td>
        </tr>

        <tr>
            <td class="info-label">Driver Name</td>
            <td class="info-value">
                <strong>{{ strtoupper($driverName ?: ($isOutsource ? 'Outside Driver' : '-')) }}</strong>
            </td>
            <td class="info-label">Driver Contact</td>
            <td class="info-value">{{ $driverContact ?: '-' }}</td>
        </tr>

        <tr>
            <td class="info-label">Dispatch Date</td>
            <td class="info-value">{{ $dispatchDate ? $dispatchDate->format('d.m.Y H:i') : now('Asia/Colombo')->format('d.m.Y H:i') }}</td>
            @if(!empty($days))
                <td class="info-label">Duration</td>
                <td class="info-value"><strong>{{ $days }} {{ $days == 1 ? 'Day' : 'Days' }}</strong></td>
            @else
                <td class="info-label">Trip Status</td>
                <td class="info-value"><strong style="color: #00703c;">{{ strtoupper($status ?: 'Assigned') }}</strong></td>
            @endif
        </tr>
    </table>

    {{-- ── COSTS & DRIVER PAYOUT ── --}}
    <div class="section-heading">Driver Payout & Trip Costs</div>
    @if(($extraKm ?? 0) > 0 || ($extraPrice ?? 0) > 0)
        <div style="border: 1px solid #d1d5db; padding: 6px 8px; margin-bottom: 6px; font-size: 10px;">
            <strong>Driver Extra KM / Price:</strong>
            @if(!empty($driverCity)) {{ $driverCity }} &mdash; @endif
            {{ number_format($extraKm ?? 0, 2) }} extra km;
            LKR {{ number_format($extraPrice ?? 0, 2) }} extra (included in driver payout).
        </div>
    @endif
    <table class="charges-table">
        <thead>
            <tr>
                <th style="width: 50%;">Description</th>
                <th class="text-right">Rate / Basis</th>
                <th class="text-right">Amount (LKR)</th>
            </tr>
        </thead>
        <tbody>
            @if($isOutsource)
                {{-- Outsource / Outside Vehicle --}}
                <tr class="category-row">
                    <td colspan="3">Outside Vehicle Transport Service</td>
                </tr>
                <tr>
                    <td style="padding-left: 16px;">
                        Outside Vehicle Service - {{ strtoupper($vehicleReg ?: 'Outsourced') }}
                        @if(!empty($days)) ({{ $days }} {{ $days == 1 ? 'Day' : 'Days' }}) @endif
                    </td>
                    <td class="text-right">Agreed Outside Rate</td>
                    <td class="text-right">{{ number_format($driverPayout, 2) }}</td>
                </tr>
                @if(isset($outsourceAdvance) && $outsourceAdvance > 0)
                <tr>
                    <td style="padding-left: 16px; color: #b45309;">
                        Advance Payment Paid at Counter
                    </td>
                    <td class="text-right" style="color: #b45309;">Advance Paid</td>
                    <td class="text-right" style="color: #b45309;">-{{ number_format($outsourceAdvance, 2) }}</td>
                </tr>
                @endif
                <tr class="total-row">
                    <td><strong>Total Vehicle Payout:</strong></td>
                    <td class="text-right">
                        {{ isset($outsourceAdvance) && $outsourceAdvance > 0 ? 'Net Balance' : 'Total' }}
                    </td>
                    <td class="text-right">
                        <strong>LKR {{ number_format(max(0, $driverPayout - ($outsourceAdvance ?? 0)), 2) }}</strong>
                    </td>
                </tr>
            @elseif($isTour)
                {{-- Tour Driver Payout --}}
                <tr class="category-row">
                    <td colspan="3">Tour Driver Allowance & Payout</td>
                </tr>
                <tr>
                    <td style="padding-left: 16px;">
                        Driver Tour Allowance
                        @if(!empty($days)) - {{ $days }} {{ $days == 1 ? 'Day' : 'Days' }} @endif
                    </td>
                    <td class="text-right">
                        @if(!empty($dailyRate) && $dailyRate > 0)
                            LKR {{ number_format($dailyRate, 2) }} / day
                        @else
                            Tour Allowance
                        @endif
                    </td>
                    <td class="text-right">{{ number_format($driverPayout, 2) }}</td>
                </tr>
                <tr class="total-row">
                    <td><strong>Total Driver Payout:</strong></td>
                    <td class="text-right">LKR</td>
                    <td class="text-right"><strong>LKR {{ number_format($driverPayout, 2) }}</strong></td>
                </tr>
            @else
                {{-- Transfer Driver Payout --}}
                <tr class="category-row">
                    <td colspan="3">Transfer Driver Share & Payout</td>
                </tr>
                <tr>
                    <td style="padding-left: 16px;">
                        Driver Transfer Payout
                        @if(!empty($driverRatePercent) && $driverRatePercent > 0)
                            ({{ $driverRatePercent }}%)
                        @endif
                    </td>
                    <td class="text-right">Transfer Share</td>
                    <td class="text-right">{{ number_format($driverPayout, 2) }}</td>
                </tr>
                <tr class="total-row">
                    <td><strong>Total Driver Payout:</strong></td>
                    <td class="text-right">LKR</td>
                    <td class="text-right"><strong>LKR {{ number_format($driverPayout, 2) }}</strong></td>
                </tr>
            @endif
        </tbody>
    </table>

    {{-- ── SIGNATURE ── --}}
    <div class="signature-block" style="margin-top: 25px;">
        @if(auth()->check())
            @if(auth()->user()->signature && file_exists(storage_path('app/public/' . auth()->user()->signature)))
                <img src="{{ storage_path('app/public/' . auth()->user()->signature) }}" style="height: 50px; object-fit: contain; margin-bottom: 5px;">
                <br>
            @endif
            <strong style="color: #333; font-size: 12px;">{{ auth()->user()->name }}</strong><br>
            @if(auth()->user()->designation)
                <span style="color: #666; font-size: 10px;">{{ auth()->user()->designation }}</span>
            @endif
        @else
            <strong style="color: #333; font-size: 12px;">Authorized Officer</strong><br>
            <span style="color: #666; font-size: 10px;">Airport Counter Operations</span>
        @endif
    </div>

    {{-- ── FOOTER ── --}}
    <div class="footer-section" style="margin-top: 25px;">
        <table class="footer-table">
            <tr>
                <td style="width: 60%;">
                    <strong style="color: #1f2937;">EUROPCAR - AIRPORT COUNTER</strong><br>
                    Bandaranaike International Airport<br>
                    Katunayake, Sri Lanka
                </td>
                <td style="width: 40%; text-align: right;">
                    Generated: {{ now('Asia/Colombo')->format('d.m.Y H:i') }}<br>
                    This is a computer generated invoice.
                </td>
            </tr>
        </table>
    </div>

</body>
</html>
