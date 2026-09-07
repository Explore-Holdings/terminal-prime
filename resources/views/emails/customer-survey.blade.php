<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Customer Survey - Terminal Prime</title>
</head>
<body style="margin: 0; padding: 30px 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; color: #1e293b;">
    <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); padding: 32px 28px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">
                TERMINAL PRIME
            </h1>
            <p style="margin: 6px 0 0 0; color: #93c5fd; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                Airport Transfer & Counter System
            </p>
        </div>

        <!-- Body Content -->
        <div style="padding: 32px 28px;">
            <h2 style="margin: 0 0 12px 0; color: #0f172a; font-size: 20px; font-weight: 700;">
                Thank you, {{ $trip->customer?->name ?? 'Valued Customer' }}!
            </h2>

            <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #475569;">
                Your trip has just been completed. We hope you had a pleasant and comfortable journey with our service.
            </p>

            <!-- Trip Summary Box -->
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 12px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; font-weight: 700;">
                    Trip Summary
                </h3>
                <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                    @if(!empty($trip->customer?->dropoff_location))
                    <tr>
                        <td style="padding: 6px 0; color: #64748b; width: 35%;">Destination:</td>
                        <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">{{ $trip->customer->dropoff_location }}</td>
                    </tr>
                    @endif
                    @if(!empty($trip->driver))
                    <tr>
                        <td style="padding: 6px 0; color: #64748b;">Driver:</td>
                        <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">
                            {{ $trip->driver->full_name ?? ($trip->driver->first_name . ' ' . $trip->driver->last_name) }}
                            <!-- @if(!empty($trip->driver->registration_number))
                                <span style="color: #64748b; font-weight: 400; font-size: 12px;">({{ $trip->driver->registration_number }})</span>
                            @endif -->
                        </td>
                    </tr>
                    @endif
                    @if(!empty($trip->driver?->vehicle?->registration_number))
                    <tr>
                        <td style="padding: 6px 0; color: #64748b;">Vehicle:</td>
                        <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">
                            {{ $trip->driver->vehicle->registration_number }}
                            @if(!empty($trip->driver->vehicle->vehicle_model))
                                <span style="color: #64748b; font-weight: 400; font-size: 12px;">- {{ $trip->driver->vehicle->vehicle_model }}</span>
                            @endif
                        </td>
                    </tr>
                    @endif
                </table>
            </div>

            <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #475569;">
                Your feedback helps us continuously improve our service quality and recognise outstanding driver performance. It only takes <strong>1 minute</strong> to complete.
            </p>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{ route('survey.show', $trip->id) }}"
                   style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 15px; font-weight: 700; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3); transition: background-color 0.2s;">
                    Rate Your Journey &rarr;
                </a>
            </div>

            <p style="margin: 24px 0 0 0; font-size: 13px; color: #94a3b8; text-align: center;">
                If the button above doesn't work, copy and paste this URL into your browser:<br>
                <a href="{{ route('survey.show', $trip->id) }}" style="color: #2563eb; text-decoration: underline; word-break: break-all;">
                    {{ route('survey.show', $trip->id) }}
                </a>
            </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 28px; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #64748b;">
                &copy; {{ date('Y') }} Terminal Prime. All rights reserved.
            </p>
            <p style="margin: 4px 0 0 0; font-size: 11px; color: #94a3b8;">
                Airport Transfer & Counter Management System
            </p>
        </div>

    </div>
</body>
</html>