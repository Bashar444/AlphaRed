<?php

namespace App\Controllers;

use App\Libraries\Plan_limits;

/**
 * API key management — Enterprise tier only.
 */
class Api_keys extends Security_Controller {

    private $plan_limits;

    function __construct() {
        parent::__construct();
        $this->plan_limits = new Plan_limits();
    }

    /**
     * List API keys for current user.
     */
    function index() {
        if (!$this->plan_limits->has_api_access()) {
            $view_data["page_title"] = app_lang("api_access");
            $view_data["upgrade_required"] = true;
            return $this->template->rander("api_keys/index", $view_data);
        }

        $view_data["page_title"] = app_lang("api_keys");
        return $this->template->rander("api_keys/index", $view_data);
    }

    /**
     * DataTable list data.
     */
    function list_data() {
        $keys = $this->Primo_api_keys_model->get_details(array("user_id" => $this->login_user->id))->getResult();
        $list_data = array();
        foreach ($keys as $key) {
            $row = array();
            $row[] = $key->id;
            $row[] = $key->label;
            $row[] = substr($key->api_key, 0, 8) . '...' . substr($key->api_key, -4);
            $row[] = $key->status === 'active'
                ? '<span class="badge bg-success">' . app_lang("active") . '</span>'
                : '<span class="badge bg-secondary">' . app_lang("revoked") . '</span>';
            $row[] = $key->request_count;
            $row[] = $key->last_used_at ? format_to_relative_time($key->last_used_at) : '—';
            $row[] = $key->created_at;

            $actions = '';
            if ($key->status === 'active') {
                $actions .= js_anchor('<i class="fa fa-ban"></i>', array("class" => "btn btn-danger btn-sm", "data-action-url" => get_uri("api_keys/revoke/$key->id"), "data-action" => "delete-confirmation"));
            }
            $row[] = $actions;

            $list_data[] = $row;
        }
        echo json_encode(array("data" => $list_data));
    }

    /**
     * Generate a new API key.
     */
    function generate() {
        if (!$this->plan_limits->has_api_access()) {
            echo json_encode(array("success" => false, "message" => app_lang("plan_upgrade_required")));
            return;
        }

        $label = $this->request->getPost('label');
        if (!$label) {
            echo json_encode(array("success" => false, "message" => "Label is required."));
            return;
        }

        // Generate a cryptographically secure API key
        $api_key = 'primo_' . bin2hex(random_bytes(32));

        $data = array(
            "user_id" => $this->login_user->id,
            "label" => $label,
            "api_key" => $api_key,
            "status" => "active",
        );

        $id = $this->Primo_api_keys_model->ci_save($data);

        echo json_encode(array(
            "success" => true,
            "message" => app_lang("api_key_generated"),
            "api_key" => $api_key, // Show once on creation
            "id" => $id,
        ));
    }

    /**
     * Revoke an API key.
     */
    function revoke($id = 0) {
        $key = $this->Primo_api_keys_model->get_details(array("id" => $id))->getRow();
        if (!$key || $key->user_id != $this->login_user->id) {
            echo json_encode(array("success" => false, "message" => "Not found."));
            return;
        }

        $this->Primo_api_keys_model->ci_save(array(
            "status" => "revoked",
            "revoked_at" => date("Y-m-d H:i:s"),
        ), $id);

        echo json_encode(array("success" => true, "message" => app_lang("api_key_revoked")));
    }
}
