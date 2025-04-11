<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class AuctionNotification extends Notification
{
    use Queueable;

    private $title;
    private $message;
    private $data;

    public function __construct($title, $message, $data = [])
    {
        $this->title = $title;
        $this->message = $message;
        $this->data = $data;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toArray($notifiable)
    {
        return [
            'title' => $this->title,
            'message' => $this->message,
            'data' => $this->data
        ];
    }
}