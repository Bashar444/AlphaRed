<table class="header-style">
    <tr class="subscription-preview-header-row">
        <td class="subscription-info-container subscription-header-style-one"><?php
            $data = array(
                "client_info" => $client_info,
                "color" => $color,
                "subscription_info" => $subscription_info
            );
            echo view('subscriptions/subscription_parts/subscription_info', $data);
            ?>
        </td>
    </tr>
</table>