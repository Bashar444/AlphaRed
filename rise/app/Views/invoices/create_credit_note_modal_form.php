<?php echo form_open(get_uri("invoices/create_credit_note"), array("id" => "create-credit-note-form", "class" => "general-form", "role" => "form")); ?>
<div class="modal-body clearfix">
    <div class="container-fluid">
        <input type="hidden" name="invoice_id" value="<?php echo $invoice_id; ?>" />
        <div class="form-group mt10">
            <div class="row">
                <div class="col-md-12">
                    <?php echo app_lang("create_credit_note_message"); ?>
                </div>
            </div>
        </div>
        <div class="form-group">
            <div class="row">
                <label for="invoice_note" class=" col-md-3"><?php echo app_lang('note'); ?></label>
                <div class=" col-md-9">
                    <?php
                    echo form_textarea(array(
                        "id" => "invoice_note",
                        "name" => "invoice_note",
                        "value" => "",
                        "class" => "form-control",
                        "placeholder" => app_lang('note'),
                        "data-rich-text-editor" => true
                    ));
                    ?>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="modal-footer">
    <button type="button" class="btn btn-default" data-bs-dismiss="modal"><span data-feather="x" class="icon-16"></span> <?php echo app_lang('cancel'); ?></button>
    <button type="submit" class="btn btn-primary"><span data-feather="check-circle" class="icon-16"></span> <?php echo app_lang('ok'); ?></button>
</div>
<?php echo form_close(); ?>

<script type="text/javascript">
    $(document).ready(function () {
        $("#create-credit-note-form").appForm({
            onSuccess: function (result) {
                window.location = "<?php echo site_url('invoices/view'); ?>/" + result.id;
            }
        });
    });
</script>