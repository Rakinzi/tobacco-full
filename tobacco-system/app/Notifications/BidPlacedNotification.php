<?php
// app/Notifications/BidPlacedNotification.php
namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class BidPlacedNotification extends Notification
{
    use Queueable;
    private $bid;

    public function __construct($bid)
    {
        $this->bid = $bid;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toArray($notifiable)
    {
        return [
            'title' => 'New Bid Placed',
            'message' => "A new bid of $" . $this->bid->amount . " has been placed",
            'data' => [
                'auction_id' => $this->bid->auction_id,
                'bid_amount' => $this->bid->amount,
                'bidder_id' => $this->bid->user_id
            ]
        ];
    }
}
