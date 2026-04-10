<table id="estimate-item-table" class="table display dataTable text-right strong table-responsive">     
    <tr>
        <td><?php echo app_lang("sub_total"); ?></td>
        <td style="width: 120px;"><?php echo to_currency($estimate_total_summary->estimate_subtotal, $estimate_total_summary->currency_symbol); ?></td>
        <?php if ($is_estimate_editable) { ?>
            <td style="width: 100px;"> </td>
        <?php } ?>
    </tr>

    <?php
    $table_data = "";
    $discount_edit_btn = "";
    if ($is_estimate_editable) {
        $discount_edit_btn = "<td class='text-center option w100'>" . modal_anchor(get_uri("estimates/discount_modal_form"), "<i data-feather='edit' class='icon-16'></i>", array("class" => "edit", "data-post-estimate_id" => $estimate_id, "title" => app_lang('edit_discount'))) . "<span class='p20'>&nbsp;&nbsp;&nbsp;</span></td>";
        $table_data = "<td></td>";
    }

    $discount_row = "<tr>
                        <td style='padding-top:13px;'>" . app_lang("discount") . "</td>
                        <td style='padding-top:13px;'>" . to_currency($estimate_total_summary->discount_total, $estimate_total_summary->currency_symbol) . "</td>
                        $discount_edit_btn
                    </tr>";

    $total_after_discount_row = "<tr>
                                    <td>" . app_lang("total_after_discount") . "</td>
                                    <td style='width:120px;'>" . to_currency($estimate_total_summary->estimate_subtotal - $estimate_total_summary->discount_total, $estimate_total_summary->currency_symbol) . "</td>
                                    $table_data
                                </tr>";

    if ($estimate_total_summary->estimate_subtotal && (!$estimate_total_summary->discount_total || ($estimate_total_summary->discount_total !== 0 && $estimate_total_summary->discount_type == "before_tax"))) {
        //when there is discount and type is before tax or no discount
        echo $discount_row;

        if ($estimate_total_summary->discount_total !== 0) {
            echo $total_after_discount_row;
        }
    }
    ?>

    <?php if ($estimate_total_summary->tax) { ?>
        <tr>
            <td><?php echo $estimate_total_summary->tax_name; ?></td>
            <td><?php echo to_currency($estimate_total_summary->tax, $estimate_total_summary->currency_symbol); ?></td>
            <?php $table_data; ?>
        </tr>
    <?php } ?>
    <?php if ($estimate_total_summary->tax2) { ?>
        <tr>
            <td><?php echo $estimate_total_summary->tax_name2; ?></td>
            <td><?php echo to_currency($estimate_total_summary->tax2, $estimate_total_summary->currency_symbol); ?></td>
            <?php $table_data; ?>
        </tr>
    <?php } ?>

    <?php
    if ($estimate_total_summary->discount_total && $estimate_total_summary->discount_type == "after_tax") {
        //when there is discount and type is after tax
        echo $discount_row;
    }
    ?>

    <tr>
        <td><?php echo app_lang("total"); ?></td>
        <td><?php echo to_currency($estimate_total_summary->estimate_total, $estimate_total_summary->currency_symbol); ?></td>
        <?php $table_data; ?>
    </tr>
</table>