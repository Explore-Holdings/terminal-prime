<?php

namespace App\Mail;

use App\Models\Customer;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class CustomerInvoiceMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $customer;
    public $invoiceNumber;

    public function __construct(Customer $customer, string $invoiceNumber)
    {
        $this->customer = $customer;
        $this->invoiceNumber = $invoiceNumber;
    }

    public function build()
    {
        return $this->subject('Customer Invoice - ' . $this->invoiceNumber)
            ->view('emails.customer-invoice')
            ->attachFromStorageDisk('public', $this->customer->invoice_path);
    }
}