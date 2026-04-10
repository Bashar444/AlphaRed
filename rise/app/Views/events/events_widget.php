<div class="card bg-white">
    <div class="card-header">
        <i data-feather="calendar" class="icon-16"></i>&nbsp; <?php echo app_lang("events"); ?>
    </div>
    <div id="upcoming-event-container">
        <div class="card-body">
            <div style="min-height: 190px;">
                <?php
                if ($events) {

                    foreach ($events as $event) {
                        ?>
                        <div class="pb10 pt10 b-b">
                            <div><?php echo modal_anchor(get_uri("events/view/"), "<i class='icon-16 mr5' style='color:" . $event->color . "; margin-top:-3px; ' data-feather='" . get_event_icon($event->share_with) . "'></i></span> " . $event->title, array("data-post-id" => encode_id($event->id, "event_id"), "data-post-cycle" => $event->cycle, "title" => app_lang("event_details"))); ?></div>
                            <div class="ml20 pl5"><?php echo view("events/event_time", array("model_info" => $event)); ?></div>
                        </div>
                        <?php
                    }
                } else {
                    echo "<div class='text-center'>" . app_lang("no_event_found") . "</div>";
                    echo "<div class='text-center p15 text-off'><i data-feather='calendar' width='10rem' height='10rem'></i></div>";
                }
                ?>
            </div>
            <div><?php echo anchor("events", app_lang("view_on_calendar"), array("class" => "btn btn-default w-100 mt15")); ?></div>
        </div>
    </div>
</div> 

<script type="text/javascript">
    $(document).ready(function () {
        initScrollbar('#upcoming-event-container', {
            setHeight: 280
        });
    });
</script> 