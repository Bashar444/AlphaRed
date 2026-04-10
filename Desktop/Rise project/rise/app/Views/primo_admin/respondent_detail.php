<div class="card">
    <div class="card-header">
        <h4>Respondent #<?php echo $respondent->id; ?></h4>
    </div>
    <div class="card-body">
        <?php $demographics = json_decode($respondent->demographics, true) ?: array(); ?>
        <div class="row mb-4">
            <div class="col-md-6">
                <table class="table table-sm">
                    <tr><th><?php echo app_lang("name"); ?></th><td><?php echo esc($respondent->first_name . ' ' . $respondent->last_name); ?></td></tr>
                    <tr><th><?php echo app_lang("phone"); ?></th><td><?php echo esc($respondent->phone); ?></td></tr>
                    <tr><th><?php echo app_lang("status"); ?></th><td><?php echo $respondent->verified ? '<span class="badge bg-success">Verified</span>' : '<span class="badge bg-warning">Pending</span>'; ?></td></tr>
                    <tr><th><?php echo app_lang("quality_score"); ?></th><td><?php echo round($respondent->quality_score, 1); ?></td></tr>
                    <tr><th><?php echo app_lang("joined"); ?></th><td><?php echo $respondent->created_at; ?></td></tr>
                </table>
            </div>
            <div class="col-md-6">
                <h6>Demographics</h6>
                <table class="table table-sm">
                    <tr><th><?php echo app_lang("age_group"); ?></th><td><?php echo $demographics['age_group'] ?? '—'; ?></td></tr>
                    <tr><th><?php echo app_lang("gender"); ?></th><td><?php echo $demographics['gender'] ?? '—'; ?></td></tr>
                    <tr><th><?php echo app_lang("region"); ?></th><td><?php echo $demographics['region'] ?? '—'; ?></td></tr>
                    <tr><th><?php echo app_lang("education"); ?></th><td><?php echo $demographics['education'] ?? '—'; ?></td></tr>
                    <tr><th><?php echo app_lang("income"); ?></th><td><?php echo $demographics['income'] ?? '—'; ?></td></tr>
                </table>
            </div>
        </div>

        <h5><?php echo app_lang("response_history"); ?></h5>
        <table class="table table-bordered table-sm">
            <thead>
                <tr><th>Response ID</th><th>Survey</th><th>Quality Score</th><th>Duration</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
                <?php foreach ($responses as $r) { ?>
                    <tr>
                        <td><?php echo $r->id; ?></td>
                        <td><?php echo $r->survey_id; ?></td>
                        <td><?php echo $r->quality_score; ?></td>
                        <td><?php echo $r->duration_secs; ?>s</td>
                        <td><?php echo $r->status; ?></td>
                        <td><?php echo $r->created_at; ?></td>
                    </tr>
                <?php } ?>
            </tbody>
        </table>
    </div>
</div>
