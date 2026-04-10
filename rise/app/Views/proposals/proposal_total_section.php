<table id="proposal-item-table" class="table display dataTable text-right strong table-responsive">     
    <tr>
        <td><?php echo app_lang("sub_total"); ?></td>
        <td style="width: 120px;"><?php echo to_currency($proposal_total_summary->proposal_subtotal, $proposal_total_summary->currency_symbol); ?></td>
        <?php if ($is_proposal_editable) { ?>
            <td style="width: 100px;"> </td>
        <?php } ?>
    </tr>

    <?php
    $discount_edit_btn = "";
    $table_data = "";
    if ($is_proposal_editable) {
        $discount_edit_btn = "<td class='text-center option w100'>" . modal_anchor(get_uri("proposals/discount_modal_form"), "<i data-feather='edit' class='icon-16'></i>", array("class" => "edit", "data-post-proposal_id" => $proposal_id, "title" => app_lang('edit_discount'))) . "<span class='p20'>&nbsp;&nbsp;&nbsp;</span></td>";
        $table_data = "<td></td>";
    }

    $discount_row = "<tr>
                        <td style='padding-top:13px;'>" . app_lang("discount") . "</td>
                        <td style='padding-top:13px;'>" . to_currency($proposal_total_summary->discount_total, $proposal_total_summary->currency_symbol) . "</td>
                        $discount_edit_btn
                    </tr>";

    $total_after_discount_row = "<tr>
                                    <td>" . app_lang("total_after_discount") . "</td>
                                    <td style='width:120px;'>" . to_currency($proposal_total_summary->proposal_subtotal - $proposal_total_summary->discount_total, $proposal_total_summary->currency_symbol) . "</td>
                                    $table_data
                                </tr>";

    if ($proposal_total_summary->proposal_subtotal && (!$proposal_total_summary->discount_total || ($proposal_total_summary->discount_total !== 0 && $proposal_total_summary->discount_type == "before_tax"))) {
        //when there is discount and type is before tax or no discount
        echo $discount_row;

        if ($proposal_total_summary->discount_total !== 0) {
            echo $total_after_discount_row;
        }
    }
    ?>

    <?php if ($proposal_total_summary->tax) { ?>
        <tr>
            <td><?php echo $proposal_total_summary->tax_name; ?></td>
            <td><?php echo to_currency($proposal_total_summary->tax, $proposal_total_summary->currency_symbol); ?></td>
            <?php $table_data; ?>
        </tr>
    <?php } ?>
    <?php if ($proposal_total_summary->tax2) { ?>
        <tr>
            <td><?php echo $proposal_total_summary->tax_name2; ?></td>
            <td><?php echo to_currency($proposal_total_summary->tax2, $proposal_total_summary->currency_symbol); ?></td>
            <?php $table_data; ?>
        </tr>
    <?php } ?>

    <?php
    if ($proposal_total_summary->discount_total && $proposal_total_summary->discount_type == "after_tax") {
        //when there is discount and type is after tax
        echo $discount_row;
    }
    ?>

    <tr>
        <td><?php echo app_lang("total"); ?></td>
        <td><?php echo to_currency($proposal_total_summary->proposal_total, $proposal_total_summary->currency_symbol); ?></td>
        <?php $table_data; ?>
    </tr>
</table>