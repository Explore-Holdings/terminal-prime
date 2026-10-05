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
        $invoiceFile = storage_path("app/public/invoices/{$this->invoiceNumber}.pdf");
        if (file_exists($invoiceFile)) {
            return $this->subject('Customer Invoice - ' . $this->invoiceNumber)
                ->view('emails.customer-invoice')
                ->attach($invoiceFile, [
                    'as'   => "{$this->invoiceNumber}.pdf",
                    'mime' => 'application/pdf',
                ]);
        }

        $payments = is_string($this->customer->payment_notes) 
            ? json_decode($this->customer->payment_notes, true) 
            : $this->customer->payment_notes;

        $currency = $this->customer->agent->new_currency ?? 'LKR';
        $price = $this->customer->agent->new_price ?? 0;

        $pettyCashReturn = \App\Models\PettyCashReturn::where('customer_id', $this->customer->id)->first();
        $returnedLkr = $pettyCashReturn ? $pettyCashReturn->amount_lkr : 0;

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('invoices.customer-invoice', [
            'customer'    => $this->customer,
            'currency'    => $currency,
            'price'       => $price,
            'paidAmount'  => $this->customer->paid_amount,
            'payments'    => collect($payments),
            'returnedLkr' => $returnedLkr,
        ]);

        return $this->subject('Customer Invoice - ' . $this->invoiceNumber)
            ->view('emails.customer-invoice')
            ->attachData($pdf->output(), "{$this->invoiceNumber}.pdf", [
                'mime' => 'application/pdf',
            ]);
    }
}