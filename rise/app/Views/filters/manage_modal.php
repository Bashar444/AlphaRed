<div class="modal-body clearfix">
    <div class="container-fluid">
        <div class="card"
             <div class="table-responsive">
            <table id="filters-table" class="display" cellspacing="0" width="100%">            
            </table>
        </div>
    </div>

</div>
</div>

<div class="modal-footer">
    <button type="button" class="btn btn-default close-manage-modal" data-bs-dismiss="modal"><span data-feather="x" class="icon-16"></span> <?php echo app_lang('close'); ?></button>
</div>

<script type="text/javascript">
    $(document).ready(function () {
        var context = "<?php echo $context; ?>";
        $("#filters-table").appTable({
            source: '<?php echo_uri("filters/list_data/" . $context . "/" . $context_id) ?>',
            order: [[0, 'asc']],
            columns: [
                {title: "<?php echo app_lang('title') ?> "},
                {title: "<?php echo app_lang('bookmark') ?> ", "class": "text-center"},
                {title: "<?php echo app_lang('bookmark_icon') ?> ", "class": "text-center"},
                {title: "<i data-feather='menu' class='icon-16'></i>", "class": "text-center option w250"}
            ]
        });

        if (!window.changeFilterInitialized) {
            window.changeFilterInitialized = [];
        }

        if (!window.changeFilterInitialized[context]) {
            $('body').on('click', '.js-change-filter-' + context, function () {
                var id = $(this).attr("data-id");
                if (window.Filters && window.Filters[context]) {
                    var filter = window.Filters[context];
                    filter.initChangeFilter(id);
                    $(".close-manage-modal").trigger("click");
                }
            });
            window.changeFilterInitialized[context] = true;
        }



    });
</script>