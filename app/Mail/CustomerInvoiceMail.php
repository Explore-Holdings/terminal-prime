<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;

class CustomerInvoiceMail extends Mailable
{
    public $customer;
    public $invoiceNumber;

    public function __construct($customer, $invoiceNumber)
    {
        $this->customer = $customer;
        $this->invoiceNumber = $invoiceNumber;
    }

    public function build()
    {
        return $this->subject('Airport Counter Invoice')
            ->view('emails.customer-invoice')
            ->attach(
                storage_path('app/public/' . $this->customer->invoice_path),
                [
                    'as' => $this->invoiceNumber . '.pdf',
                    'mime' => 'application/pdf',
                ]
            );
    }
}