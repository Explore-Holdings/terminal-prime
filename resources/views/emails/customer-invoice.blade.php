<!DOCTYPE html>
<html>
<body>

<h2>Hello {{ $customer->name }}</h2>

<p>
Thank you for choosing our service.
</p>

<p>
Your invoice is attached to this email.
</p>

<p>
Invoice Number:
<strong>{{ $invoiceNumber }}</strong>
</p>

<p>
Airport Counter Team
</p>

</body>
</html>