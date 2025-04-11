<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AuctionEndedNotification extends Notification
{
    use Queueable;
    private $auction;

    public function __construct($auction)
    {
        $this->auction = $auction;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toArray($notifiable)
    {
        return [
            'title' => 'Auction Ended',
            'message' => "Your auction has ended" . ($this->auction->winner_id ? " with a winning bid" : ""),
            'data' => [
                'auction_id' => $this->auction->id,
                'final_price' => $this->auction->current_price,
                'winner_id' => $this->auction->winner_id
            ]
        ];
    }
}
