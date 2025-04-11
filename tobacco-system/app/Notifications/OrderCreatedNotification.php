<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderCreatedNotification extends Notification
{
    use Queueable;
    private $order;

    public function __construct($order)
    {
        $this->order = $order;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toArray($notifiable)
    {
        return [
            'title' => 'New Order Created',
            'message' => "A new order has been created for your auction",
            'data' => [
                'order_id' => $this->order->id,
                'amount' => $this->order->amount,
                'buyer_id' => $this->order->buyer_id
            ]
        ];
    }
}