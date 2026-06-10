<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background:#f3f4f6; padding:30px;">
    <div style="max-width:600px; margin:auto; background:white; padding:25px; border-radius:12px;">
        <h2 style="color:#111827;">Thank you, {{ $trip->customer->name }}</h2>

        <p>We hope you had a great experience with Terminal Prime.</p>

        <p>Please take a moment to share your feedback.</p>

        <a href="{{ route('survey.show', $trip->id) }}"
        style="display:inline-block; background:#111827; color:white; padding:12px 20px; border-radius:8px; text-decoration:none;">
            Give Feedback
        </a>

        <p style="margin-top:20px; color:#6b7280; font-size:13px;">
            Terminal Prime Team
        </p>
    </div>
</body>
</html>