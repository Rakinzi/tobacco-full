<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderStatusNotification extends Notification
{
    use Queueable;
    private $order;
    private $newStatus;

    public function __construct($order, $newStatus)
    {
        $this->order = $order;
        $this->newStatus = $newStatus;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toArray($notifiable)
    {
        return [
            'title' => 'Order Status Updated',
            'message' => "Order status has been updated to: " . $this->newStatus,
            'data' => [
                'order_id' => $this->order->id,
                'new_status' => $this->newStatus,
                'delivery_date' => $this->order->delivery_date
            ]
        ];
    }
}