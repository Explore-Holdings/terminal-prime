<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            margin: 0;
            padding: 0;
            background: #f3f4f6;
            font-family: 'Cambria';
            color: #000000ff;
        }

        .wrapper {
            width: 100%;
            padding: 30px 0;
        }

        .email-card {
            max-width: 620px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 14px;
            overflow: hidden;
            box-shadow: 0 6px 18px rgba(0,0,0,0.08);
        }

        .header {
            background: #00703c;
            color: #ffffff;
            padding: 28px 30px;
            text-align: center;
        }

        .header h1 {
            margin: 0;
            font-size: 26px;
            letter-spacing: 1px;
        }

        .header p {
            margin: 8px 0 0;
            color: #d1d5db;
            font-size: 14px;
        }

        .content {
            padding: 30px;
        }

        .greeting {
            font-size: 22px;
            font-weight: bold;
            margin-bottom: 12px;
        }

        .message {
            font-size: 15px;
            line-height: 1.7;
            color: #4b5563;
        }

        .invoice-box {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 18px;
            margin: 24px 0;
        }

        .invoice-label {
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 5px;
        }

        .invoice-number {
            font-size: 24px;
            font-weight: bold;
            color: #111827;
        }

        .status {
            display: inline-block;
            margin-top: 14px;
            background: #dcfce7;
            color: #166534;
            padding: 7px 14px;
            border-radius: 999px;
            font-size: 13px;
            font-weight: bold;
        }

        .footer {
            background: #f9fafb;
            padding: 20px 30px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
        }

        .brand {
            font-weight: bold;
            color: #111827;
        }
    </style>
</head>

<body>
    <div class="wrapper">
        <div class="email-card">

            <div class="header">
                <h1>Europcar - Airport Counter</h1>
                <p>Your Airport Counter Receipt</p>
            </div>

            <div class="content">
                <div class="greeting">
                    Hello {{ $customer->name }},
                </div>

                <p class="message">
                    Thank you for choosing <strong>Europcar - Airport Counter</strong>.
                    Your payment has been successfully received and your invoice is attached to this email.
                </p>

                <div class="invoice-box">
                    <div class="invoice-label">Invoice Number</div>
                    <div class="invoice-number">{{ $invoiceNumber }}</div>

                    <div class="status">
                        Invoice Attached
                    </div>
                </div>

                <p class="message">
                    Please keep this receipt for your reference. Our team will assist you with the next step of your airport transfer process.
                </p>

                <p class="message">
                    Best regards,<br>
                    <strong>Europcar - Airport Counter Team</strong>
                </p>
            </div>

            <div class="footer">
                This is an automated email from <span class="brand">Europcar - Airport Counter</span>.<br>
                Please do not reply to this message.
            </div>

        </div>
    </div>
</body>
</html>