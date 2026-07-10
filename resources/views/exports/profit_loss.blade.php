<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
    <meta charset="utf-8">
</head>
<body style="font-family: Cambria, serif; font-size: 10pt; color: #000000;">
    <table cellpadding="4" cellspacing="0" style="width: 100%; border-collapse: collapse; font-family: Cambria, serif;">
        <!-- Company Name Row -->
        <tr>
            <td colspan="2" align="center" style="background-color: #ffffff; text-align: center; font-size: 18pt; font-weight: bold; color: #336699; font-family: Cambria, serif; padding-top: 14px; padding-bottom: 2px;">
                TERMINAL PRIME
            </td>
        </tr>
        <!-- Report Title Row -->
        <tr>
            <td colspan="2" align="center" style="background-color: #ffffff; text-align: center; font-size: 13pt; font-weight: bold; color: #555555; font-family: Cambria, serif; padding-bottom: 12px; border-bottom: 3px solid #336699;">
                PROFIT &amp; LOSS STATEMENT
            </td>
        </tr>
        <tr><td colspan="2" style="height: 10px;"></td></tr>


        <!-- Company Info Rows -->
        <tr>
            <td colspan="2" style="background-color: #b4c6e7; font-weight: bold; font-size: 11pt; height: 25px; border-bottom: 2px solid #ffffff;">
                Company name : &nbsp;&nbsp;&nbsp;&nbsp;TERMINAL PRIME
            </td>
        </tr>
        <tr>
            <td colspan="2" style="background-color: #b4c6e7; font-weight: bold; font-size: 11pt; height: 25px; border-bottom: 2px solid #ffffff;">
                Period : &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ $dateLabel }}
            </td>
        </tr>
        <tr>
            <td colspan="2" style="background-color: #b4c6e7; font-weight: bold; font-size: 11pt; height: 25px;">
                Generated At : &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ now()->format('d-M-Y H:i A') }}
            </td>
        </tr>
        <tr><td colspan="2" style="height: 15px;"></td></tr>

        <!-- Main Column Headers -->
        <tr>
            <td style="background-color: #336699; color: #ffffff; font-size: 11pt; font-weight: bold; width: 70%; border: 1px solid #c0c0c0; height: 30px;">
                PARTICULARS
            </td>
            <td style="background-color: #336699; color: #ffffff; font-size: 11pt; font-weight: bold; width: 30%; text-align: center; border: 1px solid #c0c0c0;">
                AMOUNT (LKR)
            </td>
        </tr>

        <!-- REVENUE SECTION -->
        <tr>
            <td colspan="2" style="background-color: #b4c6e7; font-weight: bold; font-size: 11pt; border: 1px solid #c0c0c0; height: 25px;">
                Revenue
            </td>
        </tr>
        <tr>
            <td style="padding-left: 20px; border: 1px solid #c0c0c0;">Gross Revenue (Trips: {{ count($trips) }})</td>
            <td style="text-align: right; border: 1px solid #c0c0c0;">{{ number_format($grossRevenue, 2) }}</td>
        </tr>
        <tr>
            <td style="font-weight: bold; background-color: #f2f2f2; border: 1px solid #c0c0c0;">Total Revenue:</td>
            <td style="text-align: right; font-weight: bold; background-color: #f2f2f2; border: 1px solid #c0c0c0;">{{ number_format($grossRevenue, 2) }}</td>
        </tr>

        <tr><td colspan="2" style="height: 10px;"></td></tr>

        <!-- COST OF SALES SECTION -->
        <tr>
            <td colspan="2" style="background-color: #b4c6e7; font-weight: bold; font-size: 11pt; border: 1px solid #c0c0c0; height: 25px;">
                Cost of Sales (Commissions)
            </td>
        </tr>
        <tr>
            <td style="padding-left: 20px; border: 1px solid #c0c0c0;">Driver Payouts</td>
            <td style="text-align: right; border: 1px solid #c0c0c0;">{{ number_format($driverPayouts, 2) }}</td>
        </tr>
        <tr>
            <td style="padding-left: 20px; border: 1px solid #c0c0c0;">Agent Payouts</td>
            <td style="text-align: right; border: 1px solid #c0c0c0;">{{ number_format($agentPayouts, 2) }}</td>
        </tr>
        <tr>
            <td style="font-weight: bold; background-color: #f2f2f2; border: 1px solid #c0c0c0;">Total Cost of Sales:</td>
            <td style="text-align: right; font-weight: bold; background-color: #f2f2f2; border: 1px solid #c0c0c0;">{{ number_format($driverPayouts + $agentPayouts, 2) }}</td>
        </tr>

        <tr><td colspan="2" style="height: 10px;"></td></tr>

        <!-- GROSS PROFIT -->
        <tr>
            <td style="font-weight: bold; background-color: #336699; color: #ffffff; font-size: 11pt; border: 1px solid #c0c0c0; height: 30px;">
                Gross Profit
            </td>
            <td style="text-align: right; font-weight: bold; background-color: #336699; color: #ffffff; font-size: 11pt; border: 1px solid #c0c0c0;">
                {{ number_format($netRevenue, 2) }}
            </td>
        </tr>

        <tr><td colspan="2" style="height: 10px;"></td></tr>

        <!-- OPERATING EXPENSES SECTION -->
        <tr>
            <td colspan="2" style="background-color: #b4c6e7; font-weight: bold; font-size: 11pt; border: 1px solid #c0c0c0; height: 25px;">
                Operating Expenses
            </td>
        </tr>
        @forelse($expenses as $exp)
            <tr>
                <td style="padding-left: 20px; border: 1px solid #c0c0c0;">{{ $exp->title }}</td>
                <td style="text-align: right; border: 1px solid #c0c0c0;">{{ number_format($exp->amount, 2) }}</td>
            </tr>
        @empty
            <tr>
                <td style="padding-left: 20px; font-style: italic; color: #666; border: 1px solid #c0c0c0;">No expenses recorded</td>
                <td style="text-align: right; border: 1px solid #c0c0c0;">0.00</td>
            </tr>
        @endforelse
        <tr>
            <td style="font-weight: bold; background-color: #f2f2f2; border: 1px solid #c0c0c0;">Total Operating Expenses:</td>
            <td style="text-align: right; font-weight: bold; background-color: #f2f2f2; border: 1px solid #c0c0c0;">{{ number_format($totalExpenses, 2) }}</td>
        </tr>

        <tr><td colspan="2" style="height: 10px;"></td></tr>

        <!-- NET INCOME -->
        <tr>
            <td style="font-weight: bold; background-color: #336699; color: #ffffff; font-size: 13pt; border: 1px solid #c0c0c0; height: 35px;">
                NET {{ $isProfit ? 'INCOME' : 'LOSS' }}
            </td>
            <td style="text-align: right; font-weight: bold; background-color: #336699; color: #ffffff; font-size: 13pt; border: 1px solid #c0c0c0;">
                {{ number_format(abs($netProfit), 2) }}
            </td>
        </tr>
    </table>
</body>
</html>
