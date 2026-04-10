<div class="clearfix default-bg">
    <div class="row">
        <div class="col-md-9 d-flex">
            <div class="card p15 w-100 pt0">
                <div id="page-content" class="clearfix grid-button">
                    <div style="max-width: 1000px; margin: auto;">
                        <div class="no-border clearfix ">
                            <ul data-bs-toggle="ajax-tab" class="nav nav-tabs bg-white title" role="tablist">
                                <li><a role="presentation" data-bs-toggle="tab" href="javascript:;" data-bs-target="#proposal-items"><?php echo app_lang("proposal") . " " . app_lang("items"); ?></a></li>
                                <li><a role="presentation" data-bs-toggle="tab" href="<?php echo_uri("proposals/editor/" . $proposal_info->id); ?>" data-bs-target="#proposal-editor"><?php echo app_lang("proposal_editor"); ?></a></li>
                                <li><a role="presentation" data-bs-toggle="tab" href="<?php echo_uri("proposals/preview/" . $proposal_info->id . "/0/1"); ?>" data-bs-target="#proposal-preview" data-reload="true"><?php echo app_lang("preview"); ?></a></li>
                            </ul>

                            <div class="tab-content">
                                <div role="tabpanel" class="tab-pane fade" id="proposal-items">

                                    <div class="p15 b-t mb15 card">
                                        <div class="clearfix p20">
                                            <!-- small font size is required to generate the pdf, overwrite that for screen -->
                                            <style type="text/css"> .invoice-meta {
                                                    font-size: 100% !important;
                                                }</style>

                                            <?php
                                            $color = get_setting("proposal_color");
                                            if (!$color) {
                                                $color = get_setting("invoice_color");
                                            }
                                            $style = get_setting("invoice_style");
                                            ?>
                                            <?php
                                            $data = array(
                                                "client_info" => $client_info,
                                                "color" => $color ? $color : "#2AA384",
                                                "proposal_info" => $proposal_info
                                            );
                                            ?>

                                            <div class="row">
                                                <div class="col-md-5 mb15">
                                                    <?php echo view('proposals/proposal_parts/proposal_from', $data); ?>
                                                </div>
                                                <div class="col-md-3">
                                                    <?php echo view('proposals/proposal_parts/proposal_to', $data); ?>
                                                </div>
                                                <div class="col-md-4 text-right">
                                                    <?php echo view('proposals/proposal_parts/proposal_info', $data); ?>
                                                </div>
                                            </div>

                                        </div>

                                        <div class="table-responsive mt15 pl15 pr15">
                                            <table id="proposal-item-table" class="display" width="100%">            
                                            </table>
                                        </div>

                                        <div class="clearfix">
                                            <div class="col-sm-8">

                                            </div>
                                            <?php if ($is_proposal_editable) { ?>
                                                <div class="float-start ml15 mt20 mb20">
                                                    <?php echo modal_anchor(get_uri("proposals/item_modal_form"), "<i data-feather='plus-circle' class='icon-16'></i> " . app_lang('add_item'), array("class" => "btn btn-info text-white", "title" => app_lang('add_item'), "data-post-proposal_id" => $proposal_info->id)); ?>
                                                </div>
                                            <?php } ?>
                                            <div class="float-end pr15" id="proposal-total-section">
                                                <?php echo view("proposals/proposal_total_section", array("is_proposal_editable" => $is_proposal_editable)); ?>
                                            </div>
                                        </div>

                                        <p class="b-t b-info pt10 m15"><?php echo nl2br($proposal_info->note ? process_images_from_content($proposal_info->note) : ""); ?></p>

                                    </div>
                                </div>
                                <div role="tabpanel" class="tab-pane fade" id="proposal-editor"></div>
                                <div role="tabpanel" class="tab-pane fade" id="proposal-preview"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3 d-grid">
            <div class="card p20">
                <div class="card-body">
                    <div id="proposal-status-bar">
                        <?php echo view("proposals/proposal_status_bar"); ?>
                    </div>
                </div>
            </div>

            <?php
            $signer_info = @unserialize($proposal_info->meta_data);
            if (!($signer_info && is_array($signer_info))) {
                $signer_info = array();
            }
            ?>
            <?php if ($proposal_status === "accepted" && ($signer_info || $proposal_info->accepted_by)) { ?>
                <div class="card">
                    <div class="page-title clearfix ">
                        <h1><?php echo app_lang("signer_info"); ?></h1>
                    </div>
                    <div class="p15">
                        <div><strong><?php echo app_lang("name"); ?>: </strong><?php echo $proposal_info->accepted_by ? get_client_contact_profile_link($proposal_info->accepted_by, $proposal_info->signer_name) : get_array_value($signer_info, "name"); ?></div>
                        <div><strong><?php echo app_lang("email"); ?>: </strong><?php echo $proposal_info->signer_email ? $proposal_info->signer_email : get_array_value($signer_info, "email"); ?></div>
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