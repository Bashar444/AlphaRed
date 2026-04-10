<div class="clearfix default-bg">
    <div class="row">
        <div class="col-md-9 d-flex">
            <div class="card p15 w-100">
                <div id="page-content" class="clearfix">
                    <div style="max-width: 1000px; margin: auto;">
                        <div>
                            <div class="clearfix p20">
                                <!-- small font size is required to generate the pdf, overwrite that for screen -->
                                <style type="text/css">
                                    .invoice-meta {
                                        font-size: 100% !important;
                                    }
                                </style>

                                <?php
                                $color = get_setting("estimate_color");
                                if (!$color) {
                                    $color = get_setting("invoice_color");
                                }
                                $style = get_setting("invoice_style");
                                ?>
                                <?php
                                $data = array(
                                    "client_info" => $client_info,
                                    "color" => $color ? $color : "#2AA384",
                                    "estimate_info" => $estimate_info
                                );

                                if ($style === "style_3") {
                                    echo view('estimates/estimate_parts/header_style_3.php', $data);
                                } else if ($style === "style_2") {
                                    echo view('estimates/estimate_parts/header_style_2.php', $data);
                                } else {
                                    echo view('estimates/estimate_parts/header_style_1.php', $data);
                                }
                                ?>

                            </div>

                            <div class="table-responsive mt15 pl15 pr15">
                                <table id="estimate-item-table" class="display" width="100%">            
                                </table>
                            </div>

                            <div class="clearfix">
                                <?php if ($is_estimate_editable) { ?>
                                    <div class="float-start mt20 ml15">
                                        <?php echo modal_anchor(get_uri("estimates/item_modal_form"), "<i data-feather='plus-circle' class='icon-16'></i> " . app_lang('add_item'), array("class" => "btn btn-info text-white", "title" => app_lang('add_item'), "data-post-estimate_id" => $estimate_info->id)); ?>
                                    </div>
                                <?php } ?>
                                <div class="float-end pr15" id="estimate-total-section">
                                    <?php echo view("estimates/estimate_total_section", array("is_estimate_editable" => $is_estimate_editable)); ?>
                                </div>
                            </div>

                            <p class="b-t b-info pt10 m15 pb10"><?php echo nl2br($estimate_info->note ? process_images_from_content($estimate_info->note) : ""); ?></p>

                            <?php
                            if (get_setting("enable_comments_on_estimates") && !($estimate_info->status === "draft")) {
                                echo view("estimates/comment_form");
                            }
                            ?>

                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3 d-grid">
            <div class="card p20">
                <div class="card-body">
                    <div id="estimate-status-bar">
                        <?php echo view("estimates/estimate_status_bar"); ?>
                    </div>
                </div>
            </div>

            <?php
            $signer_info = @unserialize($estimate_info->meta_data);
            if (!($signer_info && is_array($signer_info))) {
                $signer_info = array();
            }
            ?>
            <?php if ($estimate_status === "accepted" && ($signer_info || $estimate_info->accepted_by)) { ?>
                <div class="card">
                    <div class="card-header">
                        <h4><?php echo app_lang("signer_info"); ?></h4>
                    </div>
                    <div class="card-body p20">
                        <div><strong><?php echo app_lang("name"); ?>: </strong><?php echo $estimate_info->accepted_by ? get_client_contact_profile_link($estimate_info->accepted_by, $estimate_info->signer_name) : get_array_value($signer_info, "name"); ?></div>
                        <div><strong><?php echo app_lang("email"); ?>: </strong><?php echo $estimate_info->signer_email ? $estimate_info->signer_email : get_array_value($signer_info, "email"); ?></div>
                        <?php if (get_array_value($signer_info, "signed_date")) { ?>
                            <div><strong><?php echo app_lang("signed_date"); ?>: </strong><?php echo format_to_relative_time(get_array_value($signer_info, "signed_date")); ?></div>
                        <?php } ?>

                        <?php
                        if (get_array_value($signer_info, "signature")) {
                            $signature_file = @unserialize(get_array_value($signer_info, "signature"));
                            $signature_file_name = get_array_value($signature_file, "file_name");
                            $signature_file = get_source_url_of_file($signature_file, get_setting("timeline_file_path"), "thumbnail");
                            ?>
                            <div><strong><?php echo app_lang("signature"); ?>: </strong><br /><img class="signature-image" src="<?php echo $signature_file; ?>" alt="<?php echo $signature_file_name; ?>" /></div>
                            <?php } ?>
                    </div>
                </div>
            <?php } ?>
        </div>
    </div>
</div>