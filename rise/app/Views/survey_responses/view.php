<div class="modal-body">
    <h5>Response #<?php echo $response->id; ?></h5>
    <div class="row mb10">
        <div class="col-md-6">
            <strong>Status:</strong> <?php echo $response->status; ?>
        </div>
        <div class="col-md-6">
            <strong>Quality Score:</strong>
            <?php
            $qclass = 'success';
            if ($response->quality_score < 50) $qclass = 'danger';
            elseif ($response->quality_score < 80) $qclass = 'warning';
            ?>
            <span class="badge bg-<?php echo $qclass; ?>"><?php echo $response->quality_score; ?></span>
        </div>
    </div>
    <div class="row mb10">
        <div class="col-md-6">
            <strong>Duration:</strong> <?php echo $response->duration_secs ? gmdate("H:i:s", $response->duration_secs) : '—'; ?>
        </div>
        <div class="col-md-6">
            <strong>Completed:</strong> <?php echo $response->completed_at ?: '—'; ?>
        </div>
    </div>

    <?php
    $flags = $response->quality_flags ? json_decode($response->quality_flags, true) : array();
    if ($flags) { ?>
        <div class="alert alert-warning mb10">
            <strong>Quality Flags:</strong>
            <?php foreach ($flags as $flag) { ?>
                <span class="badge bg-warning text-dark me-1"><?php echo str_replace('_', ' ', $flag); ?></span>
            <?php } ?>
        </div>
    <?php } ?>

    <hr>
    <h6>Answers</h6>
    <?php if (isset($answers) && $answers) { ?>
        <table class="table table-bordered">
            <thead>
                <tr>
                    <th>Question</th>
                    <th>Type</th>
                    <th>Answer</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($answers as $answer) { ?>
                    <tr>
                        <td><?php echo esc($answer->question_text); ?></td>
                        <td><span class="badge bg-info"><?php echo str_replace('_', ' ', $answer->question_type); ?></span></td>
                        <td>
                            <?php
                            $val = json_decode($answer->value, true);
                            if (is_array($val)) {
                                echo esc(implode(', ', $val));
                            } else {
                                echo esc($val);
                            }
                            ?>
                        </td>
                    </tr>
                <?php } ?>
            </tbody>
        </table>
    <?php } else { ?>
        <p class="text-muted">No answers recorded.</p>
    <?php } ?>
</div>
<div class="modal-footer">
    <button type="button" class="btn btn-default" data-bs-dismiss="modal">Close</button>
</div>
