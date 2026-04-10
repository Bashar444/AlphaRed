<?php

namespace App\Controllers;

class Tasks extends Security_Controller {

    protected $Task_priority_model;
    protected $Checklist_items_model;
    protected $Pin_comments_model;
    protected $Project_settings_model;
    private $project_member_memory = array(); //array([project_id]=>true/false)
    private $project_client_memory = array(); //array([project_id]=>true/false)
    private $can_edit_client_memory = array(); //array([client_id]=>true/false, [any_clients]=>true/false)
    private $can_access_lead_memory = array(); //array([client_id]=>true/false, [any_leads]=>true/false)
    private $can_access_estimate_memory = array(); //array([client_id]=>true/false, [any_estimates]=>true/false)
    private $can_edit_subscription_memory = array(); //array([client_id]=>true/false, [any_subscriptions]=>true/false)
    private $can_edit_ticket_memory = array(); //array([client_id]=>true/false, [any_tickets]=>true/false)

    public function __construct() {
        parent::__construct();
        $this->Task_priority_model = model("App\Models\Task_priority_model");
        $this->Checklist_items_model = model('App\Models\Checklist_items_model');
        $this->Pin_comments_model = model('App\Models\Pin_comments_model');
        $this->Project_settings_model = model('App\Models\Project_settings_model');
    }

    private function get_context_id_pairs() {
        return array(
            array("context" => "project", "id_key" => "project_id", "id" => null), //keep the 1st item as project since it'll be used maximum times
            array("context" => "client", "id_key" => "client_id", "id" => null),
            array("context" => "contract", "id_key" => "contract_id", "id" => null),
            array("context" => "estimate", "id_key" => "estimate_id", "id" => null),
            array("context" => "expense", "id_key" => "expense_id", "id" => null),
            array("context" => "invoice", "id_key" => "invoice_id", "id" => null),
            array("context" => "lead", "id_key" => "lead_id", "id" => null),
            array("context" => "order", "id_key" => "order_id", "id" => null),
            array("context" => "proposal", "id_key" => "proposal_id", "id" => null),
            array("context" => "subscription", "id_key" => "subscription_id", "id" => null),
            array("context" => "ticket", "id_key" => "ticket_id", "id" => null)
        );
    }

    private function get_context_and_id($model_info = null) {
        $context_id_pairs = $this->get_context_id_pairs();

        foreach ($context_id_pairs as $pair) {
            $id_key = $pair["id_key"];
            $id = $model_info ? ($model_info->$id_key ? $model_info->$id_key : null) : null;

            $request = request(); //needed when loading controller from widget helper

            if ($id !== null) {
                $pair["id"] = $id;
            } else if ($request->getPost($id_key)) {
                $pair["id"] = $request->getPost($id_key);
            }

            if ($pair["id"] !== null) {
                return $pair;
            }
        }

        return array("context" => "project", "id" => null);
    }

    private function _client_can_create_tasks($context, $project_id) {
        //check settings for client's project permission. Client can cteate task only in own projects. 
        if ($context == "project" && get_setting("client_can_create_tasks")) {
            if ($project_id) {
                //check if it's client's project
                return $this->_is_clients_project($project_id);
            } else {
                //client has permission to create tasks on own projects
                return true;
            }
        }

        return false; //client can't create tasks in any other context except the project
    }

    private function _can_edit_clients($context_id) {

        $memory_index = $context_id ? $context_id : "any_clients";

        //this method will be used a lot in loop. To reduce db call, save the value in memory. 
        $can_edit = get_array_value($this->can_edit_client_memory, $memory_index);
        if (is_null($can_edit)) {
            $can_edit = $this->can_edit_clients($context_id);

            $this->can_edit_client_memory[$memory_index] = $can_edit;
        }

        return $can_edit;
    }

    private function _can_access_this_lead($context_id) {

        $memory_index = $context_id ? $context_id : "any_leads";

        //this method will be used a lot in loop. To reduce db call, save the value in memory. 
        $can_edit = get_array_value($this->can_access_lead_memory, $memory_index);
        if (is_null($can_edit)) {
            $can_edit = $this->can_access_this_lead($context_id);

            $this->can_access_lead_memory[$memory_index] = $can_edit;
        }

        return $can_edit;
    }

    private function _can_access_this_estimate($context_id) {

        $memory_index = $context_id ? $context_id : "any_estimates";

        //this method will be used a lot in loop. To reduce db call, save the value in memory. 
        $can_edit = get_array_value($this->can_access_estimate_memory, $memory_index);
        if (is_null($can_edit)) {
            $can_edit = $this->can_access_this_estimate($context_id);

            $this->can_access_estimate_memory[$memory_index] = $can_edit;
        }

        return $can_edit;
    }

    private function _can_edit_subscriptions($context_id) {

        $memory_index = $context_id ? $context_id : "any_subscriptions";

        //this method will be used a lot in loop. To reduce db call, save the value in memory. 
        $can_edit = get_array_value($this->can_edit_subscription_memory, $memory_index);
        if (is_null($can_edit)) {
            $can_edit = $this->can_edit_subscriptions($context_id);

            $this->can_edit_subscription_memory[$memory_index] = $can_edit;
        }

        return $can_edit;
    }

    private function _can_edit_tickets($context_id) {

        if ($this->login_user->user_type === "staff") {
            $memory_index = $context_id ? $context_id : "any_tickets";

            //this method will be used a lot in loop. To reduce db call, save the value in memory. 
            $can_edit = get_array_value($this->can_edit_ticket_memory, $memory_index);
            if (is_null($can_edit)) {
                $can_edit = $this->can_access_tickets($context_id);

                $this->can_edit_ticket_memory[$memory_index] = $can_edit;
            }

            return $can_edit;
        } else {
            return false;
        }
    }

    private function can_create_tasks($_context = null) {
        //check both with or without $context_id for all contexts

        $context_data = $this->get_context_and_id();
        $context = $_context ? $_context : $context_data["context"];
        $context_id = $context_data["id"];

        if ($this->login_user->user_type != "staff") {
            return $this->_client_can_create_tasks($context, $context_id);
        }

        if (!$_context && count($this->_get_accessible_contexts("create"))) {
            return true; //calling to show modal or button. Allow it if has access in any context. 
        }

        $permissions = $this->login_user->permissions;

        if ($context == "project" && $this->has_all_projects_restricted_role()) {
            return false;
        } else if ($context == "project" && $this->can_manage_all_projects()) {
            return true; // user has permission to create task in all projects 
        } else if ($context == "project" && $this->_user_has_project_task_creation_permission() && $context_id && $this->_is_user_a_project_member($context_id)) {
            return true; // in a project, user must be a project member with task creation permission to create tasks
        } else if ($context == "project" && $this->_user_has_project_task_creation_permission() && !$context_id) {
            return true; // don't have any project id yet. helpful when calling it from global task creation modal. 
        } else if ($context == "client" && $this->_can_edit_clients($context_id)) {
            return true;  //we're using client edit permission for creating clients or client tasks . this function will check both for a specific client or without any client
        } else if ($context == "lead" && $this->_can_access_this_lead($context_id)) {
            return true; //this function will check both for a specific lead or without any lead
        } else if ($context == "invoice" && $this->can_edit_invoices()) {
            return true;
        } else if ($context == "estimate" && $this->_can_access_this_estimate($context_id)) {
            return true;
        } else if ($context == "order" && ($this->login_user->is_admin || get_array_value($permissions, "order"))) {
            return true;
        } else if ($context == "contract" && ($this->login_user->is_admin || get_array_value($permissions, "contract"))) {
            return true;
        } else if ($context == "proposal" && ($this->login_user->is_admin || get_array_value($permissions, "proposal"))) {
            return true;
        } else if ($context == "subscription" && $this->_can_edit_subscriptions($context_id)) {
            return true;
        } else if ($context == "expense" && $this->can_access_expenses()) {
            return true;
        } else if ($context == "ticket" && $this->_can_edit_tickets($context_id)) {
            return true;
        }
    }

    private function _is_clients_project($project_id) {
        //this method will be used a lot in loop. To reduce db call, save the value in memory. 
        $is_client_project = get_array_value($this->project_client_memory, $project_id);
        if (is_null($is_client_project)) {
            $project_info = $this->Projects_model->get_one($project_id);

            $is_client_project = ($project_info->client_id == $this->login_user->client_id);
            $this->project_client_memory[$project_id] = $is_client_project;
        }

        return $is_client_project;
    }

    private function _is_user_a_project_member($project_id) {

        //this method will be used a lot in loop. To reduce db call, save the value in memory. 
        $is_member = get_array_value($this->project_member_memory, $project_id);
        if (is_null($is_member)) {
            $is_member = $this->Project_members_model->is_user_a_project_member($project_id, $this->login_user->id);
            $this->project_member_memory[$project_id] = $is_member;
        }

        return $is_member;
    }

    private function _can_edit_project_tasks($project_id) {
        //check if the user has permission to edit tasks of this project

        if ($this->login_user->user_type != "staff") {
            //check settings for client's project permission. Client can edit task only in own projects and check task edit permission also
            if ($project_id && get_setting("client_can_edit_tasks") && $this->_is_clients_project($project_id)) {
                return true;
            }

            return false;
        }

        if ($project_id && $this->can_manage_all_projects()) {
            return true; // user has permission to edit task in all projects 
        } else if ($project_id && $this->_user_has_project_task_edit_permission() && $this->_is_user_a_project_member($project_id)) {
            return true; // in a project, user must be a project member with task creation permission to create tasks
        }
    }

    private function _can_comment_on_tasks($task_info) {
        //check if the user has permission to comment on tasks

        $project_id = $task_info->project_id;

        if ($this->login_user->user_type != "staff") {
            //check settings for client's task comment permission. Client can comemnt on task only in own projects
            if ($project_id && get_setting("client_can_comment_on_tasks") && $this->_is_clients_project($project_id)) {
                return true;
            }

            return false;
        }

        if ($project_id && $this->can_manage_all_projects()) {
            return true; // user has permission to edit task in all projects 
        } else if ($project_id && $this->_user_has_project_task_comment_permission() && $this->_is_user_a_project_member($project_id)) {
            return true; // in a project, user must be a project member with task creation permission to create tasks
        } else if (!$project_id) {
            return $this->can_edit_tasks($task_info);
        }
    }

    private function can_edit_tasks($_task = null) {
        $task_info = is_object($_task) ? $_task : $this->Tasks_model->get_one($_task); //the $_task is either task id or task info
        $permissions = $this->login_user->permissions;

        if ($this->login_user->user_type === "client" && !$task_info->project_id) {
            return false; //client can't edit tasks in any other context except the project
        }

        //check permisssion for team members

        if ($task_info->project_id && $this->_can_edit_project_tasks($task_info->project_id)) {
            return true;
        } else if ($task_info->client_id && $this->_can_edit_clients($task_info->client_id)) {
            //we're using client edit permission for editing clients or client tasks 
            //this function will check both for a specific client or without any client
            return true;
        } else if ($task_info->lead_id && $this->_can_access_this_lead($task_info->lead_id)) {
            return true; //this function will check both for a specific lead or without any lead
        } else if ($task_info->invoice_id && $this->can_edit_invoices()) {
            return true;
        } else if ($task_info->estimate_id && $this->_can_access_this_estimate($task_info->estimate_id)) {
            return true;
        } else if ($task_info->order_id && ($this->login_user->is_admin || get_array_value($permissions, "order"))) {
            return true;
        } else if ($task_info->contract_id && ($this->login_user->is_admin || get_array_value($permissions, "contract"))) {
            return true;
        } else if ($task_info->proposal_id && ($this->login_user->is_admin || get_array_value($permissions, "proposal"))) {
            return true;
        } else if ($task_info->subscription_id && $this->_can_edit_subscriptions($task_info->subscription_id)) {
            return true;
        } else if ($task_info->expense_id && $this->can_access_expenses()) {
            return true;
        } else if ($task_info->ticket_id && $this->_can_edit_tickets($task_info->ticket_id)) {
            return true;
        }
    }

    private function _can_edit_task_status($task_info) {
        if ($task_info->project_id && get_array_value($this->login_user->permissions, "can_update_only_assigned_tasks_status") == "1") {
            //task is specified and user has permission to edit only assigned tasks
            $collaborators_array = explode(',', $task_info->collaborators);
            if ($task_info->assigned_to == $this->login_user->id || in_array($this->login_user->id, $collaborators_array)) {
                return true;
            }
        } else {
            return $this->can_edit_tasks($task_info);
        }
    }

    private function can_view_tasks($context = "", $context_id = 0, $task_info = null) {
        if ($task_info) {
            $context_data = $this->get_context_and_id($task_info);
            $context = $context_data["context"];
            $context_id = $context_data["id"];
        }

        if ($this->login_user->user_type != "staff") {
            //check settings for client's project permission. Client can view task only in own projects. 
            if ($context == "project" && get_setting("client_can_view_tasks") && $this->_is_clients_project($context_id)) {
                return true;
            }

            return false; //client can't view tasks in any other context except the project
        }

        //check permisssion for team members
        $permissions = $this->login_user->permissions;

        if ($context == "project" && $this->has_all_projects_restricted_role()) {
            return false;
        } else if ($context == "project" && $this->can_manage_all_projects()) {
            return true; // user has permission to view task in all projects 
        } else if ($context == "project" && $context_id && !get_array_value($this->login_user->permissions, "show_assigned_tasks_only") && $this->_is_user_a_project_member($context_id)) {
            return true; // in a project, all team members who has access to project can view tasks who doesn't have any other restriction
        } else if ($context == "project" && $task_info && get_array_value($this->login_user->permissions, "show_assigned_tasks_only") == "1") {
            //task is specified and user has permission to view only assigned tasks
            $collaborators_array = explode(',', $task_info->collaborators);
            if ($task_info->assigned_to == $this->login_user->id || in_array($this->login_user->id, $collaborators_array)) {
                return true;
            }
        } else if ($context == "project" && !$context_id && !$task_info && get_array_value($this->login_user->permissions, "show_assigned_tasks_only") == "1") {
            //task is specified and user has permission to view only assigned tasks. 
            //in global tasks list view, we have to allow this but check the specific tasks in query
            return true;
        } else if ($context == "project" && !$task_info && get_array_value($this->login_user->permissions, "show_assigned_tasks_only") == "1") {
            //task is specified and user has permission to view only assigned tasks. 
            //in tasks list view, we have to allow this but check the specific tasks in query
            return $this->_is_user_a_project_member($context_id);
        } else if ($context == "project" && !$task_info && !$context_id && !get_array_value($this->login_user->permissions, "do_not_show_projects") == "1") {
            //user can see project tasks on golbal tasks list. 
            return true;
        } else if ($context == "client" && $this->can_view_clients($context_id)) {
            return true;
        } else if ($context == "lead" && $this->_can_access_this_lead($context_id)) {
            return true;
        } else if ($context == "invoice" && $this->can_view_invoices()) {
            return true;
        } else if ($context == "estimate" && $this->_can_access_this_estimate($context_id)) {
            return true;
        } else if ($context == "order" && ($this->login_user->is_admin || get_array_value($permissions, "order"))) {
            return true;
        } else if ($context == "contract" && ($this->login_user->is_admin || get_array_value($permissions, "contract"))) {
            return true;
        } else if ($context == "proposal" && ($this->login_user->is_admin || get_array_value($permissions, "proposal"))) {
            return true;
        } else if ($context == "subscription" && $this->can_view_subscriptions()) {
            return true;
        } else if ($context == "expense" && $this->can_access_expenses()) {
            return true;
        } else if ($context == "ticket" && $this->_can_edit_tickets($context_id)) {
            return true;
        }
    }

    private function _can_delete_project_tasks($project_id) {
        //check if the user has permission to edit tasks of this project

        if ($this->login_user->user_type != "staff") {
            //check settings for client's project permission. Client can edit task only in own projects and check task edit permission also
            if ($project_id && get_setting("client_can_delete_tasks") && $this->_is_clients_project($project_id)) {
                return true;
            }

            return false;
        }

        if ($project_id && $this->can_manage_all_projects()) {
            return true; // user has permission to edit task in all projects 
        } else if ($project_id && $this->_user_has_project_task_delete_permission() && $this->_is_user_a_project_member($project_id)) {
            return true; // in a project, user must be a project member with task creation permission to create tasks
        }
    }

    private function can_delete_tasks($_task = null) {
        $task_info = is_object($_task) ? $_task : $this->Tasks_model->get_one($_task); //the $_task is either task id or task info
        $permissions = $this->login_user->permissions;

        if ($this->login_user->user_type === "client" && !$task_info->project_id) {
            return false; //client can't edit tasks in any other context except the project
        }

        //check permisssion for team members

        if ($task_info->project_id && $this->_can_delete_project_tasks($task_info->project_id)) {
            return true;
        } else if ($task_info->client_id && $this->_can_edit_clients($task_info->client_id)) {
            //we're using client edit permission for editing clients or client tasks 
            //this function will check both for a specific client or without any client
            return true;
        } else if ($task_info->lead_id && $this->_can_access_this_lead($task_info->lead_id)) {
            return true; //this function will check both for a specific lead or without any lead
        } else if ($task_info->invoice_id && $this->can_edit_invoices()) {
            return true;
        } else if ($task_info->estimate_id && $this->_can_access_this_estimate($task_info->estimate_id)) {
            return true;
        } else if ($task_info->order_id && ($this->login_user->is_admin || get_array_value($permissions, "order"))) {
            return true;
        } else if ($task_info->contract_id && ($this->login_user->is_admin || get_array_value($permissions, "contract"))) {
            return true;
        } else if ($task_info->proposal_id && ($this->login_user->is_admin || get_array_value($permissions, "proposal"))) {
            return true;
        } else if ($task_info->subscription_id && $this->_can_edit_subscriptions($task_info->subscription_id)) {
            return true;
        } else if ($task_info->expense_id && $this->can_access_expenses()) {
            return true;
        } else if ($task_info->ticket_id && $this->_can_edit_tickets($task_info->ticket_id)) {
            return true;
        }
    }

    private function _user_has_project_task_creation_permission() {
        return get_array_value($this->login_user->permissions, "can_create_tasks") == "1";
    }

    private function _user_has_project_task_edit_permission() {
        return get_array_value($this->login_user->permissions, "can_edit_tasks") == "1";
    }

    private function _user_has_project_task_delete_permission() {
        return get_array_value($this->login_user->permissions, "can_delete_tasks") == "1";
    }

    private function _user_has_project_task_comment_permission() {
        return get_array_value($this->login_user->permissions, "can_comment_on_tasks") == "1";
    }

    private function _is_active_module($module_name) {
        if (get_setting($module_name) == "1") {
            return true;
        }
    }

    private function _get_accessible_contexts($type = "create", $task_info = null) {

        $context_id_pairs = $this->get_context_id_pairs();

        $available_contexts = array();

        foreach ($context_id_pairs as $pair) {
            $context = $pair["context"];

            $alwasy_enabled_module = array("project", "client");
            if (!(in_array($context, $alwasy_enabled_module) || $this->_is_active_module("module_" . $context))) {
                continue;
            }

            if ($type == "view") {
                if ($this->can_view_tasks($context)) {
                    $available_contexts[] = $context;
                }
            } else if ($type == "edit") {
                if ($this->can_edit_tasks($task_info)) {
                    $available_contexts[] = $context;
                }
            } else {
                if ($this->can_create_tasks($context)) {
                    $available_contexts[] = $context;
                }
            }
        }

        return $available_contexts;
    }

    //this will be applied to staff users only except project context
    private function _prepare_query_parameters_for_accessible_contexts($contexts) {
        $context_options = array();

        if ($this->login_user->is_admin) {
            return $context_options;
        }

        $permissions = $this->login_user->permissions;

        foreach ($contexts as $context) {
            $context_options[$context] = array();

            if ($context === "project") {

                $context_options[$context]["show_assigned_tasks_only_user_id"] = $this->show_assigned_tasks_only_user_id();
                $context_options[$context]["project_status"] = 1; //open projects

                if (!$this->can_manage_all_projects()) {
                    $context_options[$context]["project_member_id"] = $this->login_user->id; //don't show all tasks to non-admin users
                }
            } else if ($context === "client") {

                $context_options[$context]["show_own_clients_only_user_id"] = $this->show_own_clients_only_user_id();

                if (get_array_value($permissions, "client") === "specific") {
                    $context_options[$context]["client_groups"] = get_array_value($permissions, "client_specific");
                }
            } else if ($context === "lead") {

                $context_options[$context]["show_own_leads_only_user_id"] = $this->show_own_leads_only_user_id();
            } else if ($context === "estimate") {

                $context_options[$context]["show_own_estimates_only_user_id"] = $this->show_own_estimates_only_user_id();
            } else if ($context === "ticket") {

                $context_options[$context]["show_assigned_tickets_only_user_id"] = $this->show_assigned_tickets_only_user_id();

                if (get_array_value($permissions, "ticket") === "specific") {
                    $context_options[$context]["ticket_types"] = get_array_value($permissions, "ticket_specific");
                }
            }
        }

        return array("context_options" => $context_options);
    }

    function modal_form() {
        $id = $this->request->getPost('id');
        $add_type = $this->request->getPost('add_type');
        $last_id = $this->request->getPost('last_id');

        $model_info = $this->Tasks_model->get_one($id);

        $contexts = $this->_get_accessible_contexts();
        $selected_context = get_array_value($contexts, 0);
        $view_data["show_contexts_dropdown"] = count($contexts) > 1 ? true : false; //don't show context if there is only one context

        $selected_context_id = 0;

        foreach ($this->get_context_id_pairs() as $obj) {
            $context_id_key = get_array_value($obj, "id_key");

            $value = $this->request->getPost($context_id_key) ? $this->request->getPost($context_id_key) : $model_info->{$context_id_key};
            $view_data[$context_id_key] = $value ? $value : ""; // prepare project_id, client_id, etc variables

            if ($value) {
                $selected_context = get_array_value($obj, "context");
                $selected_context_id = $value;
                $view_data["show_contexts_dropdown"] = false; //don't show context dropdown if any context is selected. 
            }
        }


        if ($add_type == "multiple" && $last_id) {
            //we've to show the lastly added information if it's the operation of adding multiple tasks
            $model_info = $this->Tasks_model->get_one($last_id);
        }

        if ($model_info->context) {
            $selected_context = $model_info->context; //has highest priority 
            $context_id_key = $model_info->context."_id";
            $selected_context_id = $model_info->{$context_id_key};
            
        }

        $dropdowns = $this->_get_task_related_dropdowns($selected_context, $selected_context_id, $selected_context_id ? true : false);

        $view_data = array_merge($view_data, $dropdowns);

        if ($id) {
            if (!$this->can_edit_tasks($model_info)) {
                app_redirect("forbidden");
            }
            $contexts = array($model_info->context); //context can't be edited dureing edit. So, pass only the saved context
            $view_data["show_contexts_dropdown"] = false; //don't show context when editing 
        } else {
            //Going to create new task. Check if the user has access in any context
            if (!$this->can_create_tasks()) {
                app_redirect("forbidden");
            }
        }

        $view_data['selected_context'] = $selected_context;
        $view_data['contexts'] = $contexts;
        $view_data['model_info'] = $model_info;
        $view_data["add_type"] = $add_type;
        $view_data['is_clone'] = $this->request->getPost('is_clone');
        $view_data['view_type'] = $this->request->getPost("view_type");

        $view_data['show_assign_to_dropdown'] = true;
        if ($this->login_user->user_type == "client") {
            if (!get_setting("client_can_assign_tasks")) {
                $view_data['show_assign_to_dropdown'] = false;
            }
        } else {
            //set default assigne to for new tasks
            if (!$id && !$view_data['model_info']->assigned_to) {
                $view_data['model_info']->assigned_to = $this->login_user->id;
            }
        }

        $view_data["custom_fields"] = $this->Custom_fields_model->get_combined_details("tasks", $view_data['model_info']->id, $this->login_user->is_admin, $this->login_user->user_type)->getResult();

        $view_data['has_checklist'] = $this->Checklist_items_model->get_details(array("task_id" => $id))->resultID->num_rows;
        $view_data['has_sub_task'] = count($this->Tasks_model->get_all_where(array("parent_task_id" => $id, "deleted" => 0))->getResult());

        $view_data["project_deadline"] = $this->_get_project_deadline_for_task(get_array_value($view_data, "project_id"));
        $view_data["show_time_with_task"] = (get_setting("show_time_with_task_start_date_and_deadline")) ? true : false;
        $view_data['time_format_24_hours'] = get_setting("time_format") == "24_hours" ? true : false;

        return $this->template->view('tasks/modal_form', $view_data);
    }

    private function get_removed_task_status_ids($project_id = 0) {
        if (!$project_id) {
            return "";
        }

        $this->init_project_settings($project_id);
        return get_setting("remove_task_statuses");
    }

    private function _get_task_related_dropdowns($context = "", $context_id = 0, $return_empty_context = false) {

        //get milestone dropdown
        $milestones_dropdown = array(array("id" => "", "text" => "-"));
        if ($context == "project" && $context_id) {
            $milestones = $this->Milestones_model->get_details(array("project_id" => $context_id, "deleted" => 0))->getResult();
            foreach ($milestones as $milestone) {
                $milestones_dropdown[] = array("id" => $milestone->id, "text" => $milestone->title);
            }
        }

        //get project members and collaborators dropdown
        if ($context == "project" && $context_id) {
            $show_client_contacts = $this->can_access_clients(true);
            if ($this->login_user->user_type === "client" && get_setting("client_can_assign_tasks")) {
                $show_client_contacts = true;
            }
            $project_members = $this->Project_members_model->get_project_members_dropdown_list($context_id, array(), $show_client_contacts, true)->getResult();
        } else if ($context == "project") {
            $project_members = array();
        } else {
            $options = array("status" => "active", "user_type" => "staff");
            $project_members = $this->Users_model->get_details($options)->getResult();
        }


        $assign_to_dropdown = array(array("id" => "", "text" => "-"));
        $collaborators_dropdown = array();
        foreach ($project_members as $member) {
            $user_id = isset($member->user_id) ? $member->user_id : $member->id;
            $member_name = isset($member->member_name) ? $member->member_name : ($member->first_name . " " . $member->last_name);
            $assign_to_dropdown[] = array("id" => $user_id, "text" => $member_name);
            $collaborators_dropdown[] = array("id" => $user_id, "text" => $member_name);
        }

        //get labels suggestion
        $label_suggestions = $this->make_labels_dropdown("task");

        $task_status_options = array();
        if ($context == "project" && $context_id) {
            $task_status_options["exclude_status_ids"] = $this->get_removed_task_status_ids($context_id);
        } else {
            $task_status_options["hide_from_non_project_related_tasks"] = 0;
        }

        //statues dropdown
        $statuses_dropdown = array();
        $statuses = $this->Task_status_model->get_details($task_status_options)->getResult();
        foreach ($statuses as $status) {
            $statuses_dropdown[] = array("id" => $status->id, "text" => $status->key_name ? app_lang($status->key_name) : $status->title);
        }

        //task points dropdown 
        $task_points = array();
        $task_point_range = get_setting("task_point_range");
        $task_point_start = 1;
        if (str_starts_with($task_point_range, '0')) {
            $task_point_start = 0;
        }

        for ($i = $task_point_start; $i <= $task_point_range * 1; $i++) {
            if ($i <= 1) {
                $task_points[$i] = $i . " " . app_lang('point');
            } else {
                $task_points[$i] = $i . " " . app_lang('points');
            }
        }


        //properties dropdown 
        $priorities = $this->Task_priority_model->get_details()->getResult();
        $priorities_dropdown = array(array("id" => "", "text" => "-"));
        foreach ($priorities as $priority) {
            $priorities_dropdown[] = array("id" => $priority->id, "text" => $priority->title);
        }




        $projects_dropdown = array(array("id" => "", "text" => "-"));
        if ($context == "project" && !$return_empty_context) {
            $project_options = array("status_id" => 1);
            if ($this->login_user->user_type == "staff") {
                if (!$this->can_manage_all_projects()) {
                    $project_options["user_id"] = $this->login_user->id; //normal user's should be able to see only the projects where they are added as a team mmeber.
                }
            } else {
                $project_options["client_id"] = $this->login_user->client_id; //get client's projects
            }

            $projects = $this->Projects_model->get_details($project_options)->getResult();

            foreach ($projects as $project) {
                $projects_dropdown[] = array("id" => $project->id, "text" => $project->title);
            }
        }


        $clients_dropdown = array(array("id" => "", "text" => "-"));
        if ($context === "client" && !$return_empty_context) {
            //get clients dropdown
            $this->init_permission_checker("client");
            $options = array(
                "show_own_clients_only_user_id" => $this->show_own_clients_only_user_id(),
                "client_groups" => $this->allowed_client_groups
            );

            $clients = $this->Clients_model->get_details($options)->getResult();
            foreach ($clients as $client) {
                $clients_dropdown[] = array("id" => $client->id, "text" => $client->company_name);
            }
        }

        $leads_dropdown = array(array("id" => "", "text" => "-"));
        if ($context === "lead" && !$return_empty_context) {
            //get leads dropdown
            $this->init_permission_checker("lead");
            $options = array(
                "leads_only" => true,
                "owner_id" => $this->show_own_leads_only_user_id()
            );

            $leads = $this->Clients_model->get_details($options)->getResult();
            foreach ($leads as $lead) {
                $leads_dropdown[] = array("id" => $lead->id, "text" => $lead->company_name);
            }
        }

        $invoices_dropdown = array(array("id" => "", "text" => "-"));
        if ($context === "invoice" && !$return_empty_context) {
            //get invoices dropdown
            $invoices = $this->Invoices_model->get_all_where(array("deleted" => 0))->getResult();
            foreach ($invoices as $invoice) {
                $invoices_dropdown[] = array("id" => $invoice->id, "text" => get_invoice_id($invoice->id));
            }
        }

        $estimates_dropdown = array(array("id" => "", "text" => "-"));
        if ($context === "estimate" && !$return_empty_context) {
            //get estimates dropdown
            $options = array(
                "show_own_estimates_only_user_id" => $this->show_own_estimates_only_user_id(),
            );

            $estimates = $this->Estimates_model->get_details($options)->getResult();
            foreach ($estimates as $estimate) {
                $estimates_dropdown[] = array("id" => $estimate->id, "text" => get_estimate_id($estimate->id));
            }
        }

        $orders_dropdown = array(array("id" => "", "text" => "-"));
        if ($context === "order" && !$return_empty_context) {
            //get orders dropdown
            $orders = $this->Orders_model->get_all_where(array("deleted" => 0))->getResult();
            foreach ($orders as $order) {
                $orders_dropdown[] = array("id" => $order->id, "text" => get_order_id($order->id));
            }
        }

        $contracts_dropdown = array(array("id" => "", "text" => "-"));
        if ($context === "contract" && !$return_empty_context) {
            //get contracts dropdown
            $contracts = $this->Contracts_model->get_all_where(array("deleted" => 0))->getResult();
            foreach ($contracts as $contract) {
                $contracts_dropdown[] = array("id" => $contract->id, "text" => $contract->title);
            }
        }

        $proposals_dropdown = array(array("id" => "", "text" => "-"));
        if ($context === "proposal" && !$return_empty_context) {
            //get proposals dropdown
            $proposals = $this->Proposals_model->get_all_where(array("deleted" => 0))->getResult();
            foreach ($proposals as $proposal) {
                $proposals_dropdown[] = array("id" => $proposal->id, "text" => get_proposal_id($proposal->id));
            }
        }

        $subscriptions_dropdown = array(array("id" => "", "text" => "-"));
        if ($context === "subscription" && !$return_empty_context) {
            //get subscriptions dropdown
            $subscriptions = $this->Subscriptions_model->get_all_where(array("deleted" => 0))->getResult();
            foreach ($subscriptions as $subscription) {
                $subscriptions_dropdown[] = array("id" => $subscription->id, "text" => $subscription->title);
            }
        }

        $expenses_dropdown = array(array("id" => "", "text" => "-"));
        if ($context === "expense" && !$return_empty_context) {
            //get expenses dropdown
            $expenses = $this->Expenses_model->get_all_where(array("deleted" => 0))->getResult();
            foreach ($expenses as $expense) {
                $expenses_dropdown[] = array("id" => $expense->id, "text" => ($expense->title ? $expense->title : format_to_date($expense->expense_date, false)));
            }
        }

        $tickets_dropdown = array(array("id" => "", "text" => "-"));
        if ($context === "ticket" && !$return_empty_context) {
            $this->init_permission_checker("ticket");

            $options = array(
                "ticket_types" => $this->allowed_ticket_types,
                "show_assigned_tickets_only_user_id" => $this->show_assigned_tickets_only_user_id()
            );

            //get tickets dropdown
            $tickets = $this->Tickets_model->get_details($options)->getResult();
            foreach ($tickets as $ticket) {
                $tickets_dropdown[] = array("id" => $ticket->id, "text" => $ticket->title);
            }
        }

        return array(
            "milestones_dropdown" => $milestones_dropdown,
            "assign_to_dropdown" => $assign_to_dropdown,
            "collaborators_dropdown" => $collaborators_dropdown,
            "label_suggestions" => $label_suggestions,
            "statuses_dropdown" => $statuses_dropdown,
            "points_dropdown" => $task_points,
            "priorities_dropdown" => $priorities_dropdown,
            "projects_dropdown" => $projects_dropdown,
            "clients_dropdown" => $clients_dropdown,
            "leads_dropdown" => $leads_dropdown,
            "invoices_dropdown" => $invoices_dropdown,
            "estimates_dropdown" => $estimates_dropdown,
            "orders_dropdown" => $orders_dropdown,
            "contracts_dropdown" => $contracts_dropdown,
            "proposals_dropdown" => $proposals_dropdown,
            "subscriptions_dropdown" => $subscriptions_dropdown,
            "expenses_dropdown" => $expenses_dropdown,
            "tickets_dropdown" => $tickets_dropdown
        );
    }

    private function _get_project_deadline_for_task($project_id = 0) {
        if (!$project_id) {
            return "";
        }

        $project_deadline_date = "";
        $project_deadline = $this->Projects_model->get_one($project_id)->deadline;
        if (get_setting("task_deadline_should_be_before_project_deadline") && is_date_exists($project_deadline)) {
            $project_deadline_date = format_to_date($project_deadline, false);
        }

        return $project_deadline_date;
    }

    /* insert/upadate/clone a task */

    function save() {

        $project_id = $this->request->getPost('project_id');
        $id = $this->request->getPost('id');
        $add_type = $this->request->getPost('add_type');
        $now = get_current_utc_time();

        $is_clone = $this->request->getPost('is_clone');
        $main_task_id = "";
        if ($is_clone && $id) {
            $main_task_id = $id; //store main task id to get items later
            $id = ""; //on cloning task, save as new
        }

        $client_id = $this->request->getPost('client_id');
        $lead_id = $this->request->getPost('lead_id');
        $invoice_id = $this->request->getPost('invoice_id');
        $estimate_id = $this->request->getPost('estimate_id');
        $order_id = $this->request->getPost('order_id');
        $contract_id = $this->request->getPost('contract_id');
        $proposal_id = $this->request->getPost('proposal_id');
        $subscription_id = $this->request->getPost('subscription_id');
        $expense_id = $this->request->getPost('expense_id');
        $ticket_id = $this->request->getPost('ticket_id');

        $context_data = $this->get_context_and_id();
        $context = $context_data["context"] ? $context_data["context"] : "project";

        if ($id) {
            $task_info = $this->Tasks_model->get_one($id);
            if (!$this->can_edit_tasks($task_info)) {
                app_redirect("forbidden");
            }
        } else {
            if (!$this->can_create_tasks($context)) {
                app_redirect("forbidden");
            }
        }

        $assigned_to = $this->request->getPost('assigned_to');
        $collaborators = $this->request->getPost('collaborators');
        $recurring = $this->request->getPost('recurring') ? 1 : 0;
        $repeat_every = $this->request->getPost('repeat_every');
        $repeat_type = $this->request->getPost('repeat_type');
        $no_of_cycles = $this->request->getPost('no_of_cycles');
        $status_id = $this->request->getPost('status_id');
        $priority_id = $this->request->getPost('priority_id');
        $milestone_id = $this->request->getPost('milestone_id');

        $start_date = $this->request->getPost('start_date');
        $deadline = $this->request->getPost('deadline');

        //convert to 24hrs time format
        $start_time = $this->request->getPost('start_time');
        $end_time = $this->request->getPost('end_time');
        if (get_setting("time_format") != "24_hours") {
            $start_time = convert_time_to_24hours_format($start_time);
            $end_time = convert_time_to_24hours_format($end_time);
        }
        if ($start_date) {
            //join date with time
            if ($start_time) {
                $start_date = $start_date . " " . $start_time;
            }
        }
        if ($deadline) {
            if ($end_time) {
                $deadline = $deadline . " " . $end_time;
            }
        }

        $data = array(
            "title" => $this->request->getPost('title'),
            "description" => $this->request->getPost('description'),
            "project_id" => $project_id ? $project_id : 0,
            "milestone_id" => $milestone_id ? $milestone_id : 0,
            "points" => $this->request->getPost('points'),
            "status_id" => $status_id,
            "client_id" => $client_id ? $client_id : 0,
            "lead_id" => $lead_id ? $lead_id : 0,
            "invoice_id" => $invoice_id ? $invoice_id : 0,
            "estimate_id" => $estimate_id ? $estimate_id : 0,
            "order_id" => $order_id ? $order_id : 0,
            "contract_id" => $contract_id ? $contract_id : 0,
            "proposal_id" => $proposal_id ? $proposal_id : 0,
            "expense_id" => $expense_id ? $expense_id : 0,
            "subscription_id" => $subscription_id ? $subscription_id : 0,
            "priority_id" => $priority_id ? $priority_id : 0,
            "labels" => $this->request->getPost('labels'),
            "start_date" => $start_date,
            "deadline" => $deadline,
            "recurring" => $recurring,
            "repeat_every" => $repeat_every ? $repeat_every : 0,
            "repeat_type" => $repeat_type ? $repeat_type : NULL,
            "no_of_cycles" => $no_of_cycles ? $no_of_cycles : 0,
        );

        if (!$id) {
            $data["created_date"] = $now;
            $data["context"] = $context;
            $data["sort"] = $this->Tasks_model->get_next_sort_value($project_id, $status_id);
        }

        if ($ticket_id) {
            $data["ticket_id"] = $ticket_id;
        }

        //clint can't save the assign to and collaborators
        if ($this->login_user->user_type == "client") {
            if (get_setting("client_can_assign_tasks")) {
                $data["assigned_to"] = $assigned_to;
            } else if (!$id) { //it's new data to save
                $data["assigned_to"] = 0;
            }

            $data["collaborators"] = "";
        } else {
            $data["assigned_to"] = $assigned_to;
            $data["collaborators"] = $collaborators;
        }

        $data = clean_data($data);

        //set null value after cleaning the data
        if (!$data["start_date"]) {
            $data["start_date"] = NULL;
        }

        if (!$data["deadline"]) {
            $data["deadline"] = NULL;
        }

        //deadline must be greater or equal to start date
        if ($data["start_date"] && $data["deadline"] && $data["deadline"] < $data["start_date"]) {
            echo json_encode(array("success" => false, 'message' => app_lang('deadline_must_be_equal_or_greater_than_start_date')));
            return false;
        }

        $copy_checklist = $this->request->getPost("copy_checklist");

        $next_recurring_date = "";

        if ($recurring && get_setting("enable_recurring_option_for_tasks")) {
            //set next recurring date for recurring tasks

            if ($id) {
                //update
                if ($this->request->getPost('next_recurring_date')) { //submitted any recurring date? set it.
                    $next_recurring_date = $this->request->getPost('next_recurring_date');
                } else {
                    //re-calculate the next recurring date, if any recurring fields has changed.
                    if ($task_info->recurring != $data['recurring'] || $task_info->repeat_every != $data['repeat_every'] || $task_info->repeat_type != $data['repeat_type'] || $task_info->start_date != $data['start_date']) {
                        $recurring_start_date = $start_date ? $start_date : $task_info->created_date;
                        $next_recurring_date = add_period_to_date($recurring_start_date, $repeat_every, $repeat_type);
                    }
                }
            } else {
                //insert new
                $recurring_start_date = $start_date ? $start_date : get_array_value($data, "created_date");
                $next_recurring_date = add_period_to_date($recurring_start_date, $repeat_every, $repeat_type);
            }


            //recurring date must have to set a future date
            if ($next_recurring_date && get_today_date() >= $next_recurring_date) {
                echo json_encode(array("success" => false, 'message' => app_lang('past_recurring_date_error_message_title_for_tasks'), 'next_recurring_date_error' => app_lang('past_recurring_date_error_message'), "next_recurring_date_value" => $next_recurring_date));
                return false;
            }
        }

        //save status changing time for edit mode
        if ($id) {
            if ($task_info->status_id !== $status_id) {
                $data["status_changed_at"] = $now;
            }

            $this->check_sub_tasks_statuses($status_id, $id);
        }

        $save_id = $this->Tasks_model->ci_save($data, $id);
        if ($save_id) {

            if ($is_clone && $main_task_id) {
                //clone task checklist
                if ($copy_checklist) {
                    $checklist_items = $this->Checklist_items_model->get_all_where(array("task_id" => $main_task_id, "deleted" => 0))->getResult();
                    foreach ($checklist_items as $checklist_item) {
                        //prepare new checklist data
                        $checklist_item_data = (array) $checklist_item;
                        unset($checklist_item_data["id"]);
                        $checklist_item_data['task_id'] = $save_id;

                        $checklist_item = $this->Checklist_items_model->ci_save($checklist_item_data);
                    }
                }

                //clone sub tasks
                if ($this->request->getPost("copy_sub_tasks")) {
                    $sub_tasks = $this->Tasks_model->get_all_where(array("parent_task_id" => $main_task_id, "deleted" => 0))->getResult();
                    foreach ($sub_tasks as $sub_task) {
                        //prepare new sub task data
                        $sub_task_data = (array) $sub_task;

                        unset($sub_task_data["id"]);
                        unset($sub_task_data["blocked_by"]);
                        unset($sub_task_data["blocking"]);

                        $sub_task_data['status_id'] = 1;
                        $sub_task_data['parent_task_id'] = $save_id;
                        $sub_task_data['created_date'] = $now;

                        $sub_task_data["sort"] = $this->Tasks_model->get_next_sort_value($sub_task_data["project_id"], $sub_task_data['status_id']);

                        $sub_task_save_id = $this->Tasks_model->ci_save($sub_task_data);

                        //clone sub task checklist
                        if ($copy_checklist) {
                            $checklist_items = $this->Checklist_items_model->get_all_where(array("task_id" => $sub_task->id, "deleted" => 0))->getResult();
                            foreach ($checklist_items as $checklist_item) {
                                //prepare new checklist data
                                $checklist_item_data = (array) $checklist_item;
                                unset($checklist_item_data["id"]);
                                $checklist_item_data['task_id'] = $sub_task_save_id;

                                $this->Checklist_items_model->ci_save($checklist_item_data);
                            }
                        }
                    }
                }
            }

            //save next recurring date 
            if ($next_recurring_date) {
                $recurring_task_data = array(
                    "next_recurring_date" => $next_recurring_date
                );
                $this->Tasks_model->save_reminder_date($recurring_task_data, $save_id);
            }

            // if created from ticket then save the task id
            if ($ticket_id) {
                $data = array("task_id" => $save_id);
                $this->Tickets_model->ci_save($data, $ticket_id);
            }

            $activity_log_id = get_array_value($data, "activity_log_id");

            $new_activity_log_id = save_custom_fields("tasks", $save_id, $this->login_user->is_admin, $this->login_user->user_type, $activity_log_id);

            if ($id) {
                //updated
                if ($task_info->context === "project") {
                    log_notification("project_task_updated", array("project_id" => $project_id, "task_id" => $save_id, "activity_log_id" => $new_activity_log_id ? $new_activity_log_id : $activity_log_id));
                } else {
                    $context_id_key = $task_info->context . "_id";
                    $context_id_value = ${$task_info->context . "_id"};

                    log_notification("general_task_updated", array("$context_id_key" => $context_id_value, "task_id" => $save_id, "activity_log_id" => $new_activity_log_id ? $new_activity_log_id : $activity_log_id));
                }
            } else {
                //created
                if ($context === "project") {
                    log_notification("project_task_created", array("project_id" => $project_id, "task_id" => $save_id));
                } else {
                    $context_id_key = $context . "_id";
                    $context_id_value = ${$context . "_id"};

                    log_notification("general_task_created", array("$context_id_key" => $context_id_value, "task_id" => $save_id));
                }

                //save uploaded files as comment
                $target_path = get_setting("timeline_file_path");
                $files_data = move_files_from_temp_dir_to_permanent_dir($target_path, "project_comment");

                if ($files_data && $files_data != "a:0:{}") {
                    $comment_data = array(
                        "created_by" => $this->login_user->id,
                        "created_at" => $now,
                        "project_id" => $project_id,
                        "task_id" => $save_id
                    );

                    $comment_data = clean_data($comment_data);

                    $comment_data["files"] = $files_data; //don't clean serilized data

                    $this->Project_comments_model->save_comment($comment_data);
                }
            }

            echo json_encode(array("success" => true, "data" => $this->_row_data($save_id), 'id' => $save_id, 'message' => app_lang('record_saved'), "add_type" => $add_type));
        } else {
            echo json_encode(array("success" => false, 'message' => app_lang('error_occurred')));
        }
    }

    /*
     * list of tasks, prepared for datatable
     * @param string $context. client/lead/invoice etc.
     * @param int $id. client_id/lead_id etc.
     */

    function list_data($context = "", $context_id = 0) {
        validate_numeric_value($context_id);
        if (!$this->can_view_tasks($context, $context_id)) {
            app_redirect("forbidden");
        }
        $custom_fields = $this->Custom_fields_model->get_available_fields_for_table("tasks", $this->login_user->is_admin, $this->login_user->user_type);

        $milestone_id = $this->request->getPost('milestone_id');

        $quick_filter = $this->request->getPost('quick_filter');
        if ($quick_filter) {
            $status = "";
        } else {
            $status = $this->request->getPost('status_id') ? implode(",", $this->request->getPost('status_id')) : "";
        }

        $show_time_with_task = (get_setting("show_time_with_task_start_date_and_deadline")) ? true : false;

        $options = array(
            "assigned_to" => $this->request->getPost('assigned_to'),
            "deadline" => $this->request->getPost('deadline'),
            "status_ids" => $status,
            "milestone_id" => $milestone_id,
            "priority_id" => $this->request->getPost('priority_id'),
            "custom_fields" => $custom_fields,
            "unread_status_user_id" => $this->login_user->id,
            "quick_filter" => $quick_filter,
            "label_id" => $this->request->getPost('label_id'),
            "custom_field_filter" => $this->prepare_custom_field_filter_values("tasks", $this->login_user->is_admin, $this->login_user->user_type)
        );

        //add the context data like $options["client_id"] = 2;
        $context_id_pairs = $this->get_context_id_pairs();
        $pair_key = array_keys(array_column($context_id_pairs, 'context'), $context);
        $pair_key = get_array_value($pair_key, 0);
        $pair = get_array_value($context_id_pairs, $pair_key);
        $options[get_array_value($pair, "id_key")] = $context_id;

        if ($context === "project") {
            $options["show_assigned_tasks_only_user_id"] = $this->show_assigned_tasks_only_user_id();
        }

        $all_options = append_server_side_filtering_commmon_params($options);

        $result = $this->Tasks_model->get_details($all_options);

        //by this, we can handel the server side or client side from the app table prams.
        if (get_array_value($all_options, "server_side")) {
            $list_data = get_array_value($result, "data");
        } else {
            $list_data = $result->getResult();
            $result = array();
        }

        $tasks_edit_permissions = $this->_get_tasks_edit_permissions($list_data);
        $tasks_status_edit_permissions = $this->_get_tasks_status_edit_permissions($list_data, $tasks_edit_permissions);

        $result_data = array();
        foreach ($list_data as $data) {
            $result_data[] = $this->_make_row($data, $custom_fields, $show_time_with_task, $tasks_edit_permissions, $tasks_status_edit_permissions);
        }

        $result["data"] = $result_data;

        echo json_encode($result);
    }

    /* return a row of task list table */

    private function _row_data($id) {
        $custom_fields = $this->Custom_fields_model->get_available_fields_for_table("tasks", $this->login_user->is_admin, $this->login_user->user_type);

        $options = array("id" => $id, "custom_fields" => $custom_fields);
        $data = $this->Tasks_model->get_details($options)->getRow();

        $show_time_with_task = (get_setting("show_time_with_task_start_date_and_deadline")) ? true : false;

        $tasks_edit_permissions = $this->_get_tasks_edit_permissions(array($data));
        $tasks_status_edit_permissions = $this->_get_tasks_status_edit_permissions(array($data), $tasks_edit_permissions);

        return $this->_make_row($data, $custom_fields, $show_time_with_task, $tasks_edit_permissions, $tasks_status_edit_permissions);
    }

    /* prepare a row of task list table */

    private function _make_row($data, $custom_fields, $show_time_with_task, $tasks_edit_permissions, $tasks_status_edit_permissions) {
        $unread_comments_class = "";
        $icon = "";
        if (isset($data->unread) && $data->unread && $data->unread != "0") {
            $unread_comments_class = "unread-comments-of-tasks";
            $icon = "<i data-feather='message-circle' class='icon-16 ml5 unread-comments-of-tasks-icon'></i>";
        }

        $title = "";
        $main_task_id = "#" . $data->id;
        $sub_task_search_column = "#" . $data->id;

        if ($data->parent_task_id) {
            $sub_task_search_column = "#" . $data->parent_task_id;
            //this is a sub task
            $title = "<span class='sub-task-icon mr5' title='" . app_lang("sub_task") . "'><i data-feather='git-merge' class='icon-14'></i></span>";
        }

        $toggle_sub_task_icon = "";

        if ($data->has_sub_tasks) {
            $toggle_sub_task_icon = "<span class='filter-sub-task-button clickable ml5' title='" . app_lang("show_sub_tasks") . "' main-task-id= '$main_task_id'><i data-feather='filter' class='icon-16'></i></span>";
        }

        $title .= modal_anchor(get_uri("tasks/view"), $data->title . $icon, array("title" => app_lang('task_info') . " #$data->id", "data-post-id" => $data->id, "data-search" => $sub_task_search_column, "class" => $unread_comments_class, "data-modal-lg" => "1"));

        $task_point = "";
        if ($data->points > 1) {
            $task_point .= "<span class='badge badge-light clickable mt0' title='" . app_lang('points') . "'>" . $data->points . "</span> ";
        }
        $title .= "<span class='float-end ml5'>" . $task_point . "</span>";

        if ($data->priority_id) {
            $title .= "<span class='float-end' title='" . app_lang('priority') . ": " . $data->priority_title . "'>
                            <span class='sub-task-icon priority-badge' style='background: $data->priority_color'><i data-feather='$data->priority_icon' class='icon-14'></i></span> $toggle_sub_task_icon
                      </span>";
        }

        $task_labels = make_labels_view_data($data->labels_list, true);

        $title .= "<span class='float-end mr5'>" . $task_labels . "</span>";

        $context_title = "";
        if ($data->project_id) {
            $context_title = anchor(get_uri("projects/view/" . $data->project_id), $data->project_title ? $data->project_title : "");
        } else if ($data->client_id) {
            $context_title = anchor(get_uri("clients/view/" . $data->client_id), $data->company_name ? $data->company_name : "");
        } else if ($data->lead_id) {
            $context_title = anchor(get_uri("leads/view/" . $data->lead_id), $data->company_name ? $data->company_name : "");
        } else if ($data->invoice_id) {
            $context_title = anchor(get_uri("invoices/view/" . $data->invoice_id), get_invoice_id($data->invoice_id));
        } else if ($data->estimate_id) {
            $context_title = anchor(get_uri("estimates/view/" . $data->estimate_id), get_estimate_id($data->estimate_id));
        } else if ($data->order_id) {
            $context_title = anchor(get_uri("orders/view/" . $data->order_id), get_order_id($data->order_id));
        } else if ($data->contract_id) {
            $context_title = anchor(get_uri("contracts/view/" . $data->contract_id), $data->contract_title ? $data->contract_title : "");
        } else if ($data->proposal_id) {
            $context_title = anchor(get_uri("proposals/view/" . $data->proposal_id), get_proposal_id($data->proposal_id));
        } else if ($data->subscription_id) {
            $context_title = anchor(get_uri("subscriptions/view/" . $data->subscription_id), $data->subscription_title ? $data->subscription_title : "");
        } else if ($data->expense_id) {
            $context_title = modal_anchor(get_uri("expenses/expense_details"), ($data->expense_title ? $data->expense_title : format_to_date($data->expense_date, false)), array("title" => app_lang("expense_details"), "data-post-id" => $data->expense_id, "data-modal-lg" => "1"));
        } else if ($data->ticket_id) {
            $context_title = anchor(get_uri("tickets/view/" . $data->ticket_id), $data->ticket_title ? $data->ticket_title : "");
        }

        $milestone_title = "-";
        if ($data->milestone_title) {
            $milestone_title = $data->milestone_title;
        }

        $assigned_to = "-";

        if ($data->assigned_to) {
            $image_url = get_avatar($data->assigned_to_avatar);
            $assigned_to_user = "<span class='avatar avatar-xs mr10'><img src='$image_url' alt='...'></span> $data->assigned_to_user";
            $assigned_to = get_team_member_profile_link($data->assigned_to, $assigned_to_user);

            if ($data->user_type != "staff") {
                $assigned_to = get_client_contact_profile_link($data->assigned_to, $assigned_to_user);
            }
        }


        $collaborators = $this->_get_collaborators($data->collaborator_list);

        if (!$collaborators) {
            $collaborators = "-";
        }


        $checkbox_class = "checkbox-blank";
        if ($data->status_key_name === "done") {
            $checkbox_class = "checkbox-checked";
        }

        if (get_array_value($tasks_status_edit_permissions, $data->id)) {
            //show changeable status checkbox and link to team members
            $check_status = js_anchor("<span class='$checkbox_class mr15 float-start'></span>", array('title' => "", "class" => "js-task", "data-id" => $data->id, "data-value" => $data->status_key_name === "done" ? "1" : "3", "data-act" => "update-task-status-checkbox")) . $data->id;
            $status = js_anchor($data->status_key_name ? app_lang($data->status_key_name) : $data->status_title, array('title' => "", "class" => "", "data-id" => $data->id, "data-value" => $data->status_id, "data-act" => "update-task-status"));
        } else {
            //don't show clickable checkboxes/status to client
            if ($checkbox_class == "checkbox-blank") {
                $checkbox_class = "checkbox-un-checked";
            }
            $check_status = "<span class='$checkbox_class mr15 float-start'></span> " . $data->id;
            $status = $data->status_key_name ? app_lang($data->status_key_name) : $data->status_title;
        }



        $deadline_text = "-";
        if ($data->deadline && is_date_exists($data->deadline)) {

            if ($show_time_with_task) {
                if (date("H:i:s", strtotime($data->deadline)) == "00:00:00") {
                    $deadline_text = format_to_date($data->deadline, false);
                } else {
                    $deadline_text = format_to_relative_time($data->deadline, false, false, true);
                }
            } else {
                $deadline_text = format_to_date($data->deadline, false);
            }

            if (get_my_local_time("Y-m-d") > $data->deadline && $data->status_id != "3") {
                $deadline_text = "<span class='text-danger'>" . $deadline_text . "</span> ";
            } else if (format_to_date(get_my_local_time(), false) == format_to_date($data->deadline, false) && $data->status_id != "3") {
                $deadline_text = "<span class='text-warning'>" . $deadline_text . "</span> ";
            }
        }


        $start_date = "-";
        if (is_date_exists($data->start_date)) {
            if ($show_time_with_task) {
                if (date("H:i:s", strtotime($data->start_date)) == "00:00:00") {
                    $start_date = format_to_date($data->start_date, false);
                } else {
                    $start_date = format_to_relative_time($data->start_date, false, false, true);
                }
            } else {
                $start_date = format_to_date($data->start_date, false);
            }
        }

        $options = "";

        if (get_array_value($tasks_edit_permissions, $data->id)) {
            $options .= modal_anchor(get_uri("tasks/modal_form"), "<i data-feather='edit' class='icon-16'></i>", array("class" => "edit", "title" => app_lang('edit_task'), "data-post-id" => $data->id));
        }
        if ($this->can_delete_tasks($data)) {
            $options .= js_anchor("<i data-feather='x' class='icon-16'></i>", array('title' => app_lang('delete_task'), "class" => "delete", "data-id" => $data->id, "data-action-url" => get_uri("tasks/delete"), "data-action" => "delete-confirmation"));
        }

        $row_data = array(
            $data->status_color,
            $check_status,
            $title,
            $data->start_date,
            $start_date,
            $data->deadline,
            $deadline_text,
            $milestone_title,
            $context_title,
            $assigned_to,
            $collaborators,
            $status
        );

        foreach ($custom_fields as $field) {
            $cf_id = "cfv_" . $field->id;
            $row_data[] = $this->template->view("custom_fields/output_" . $field->field_type, array("value" => $data->$cf_id));
        }

        $row_data[] = $options;

        return $row_data;
    }

    /* upload a post file */

    function upload_file() {
        upload_file_to_temp();
    }

    /* check valid file for project */

    function validate_task_file() {
        return validate_post_file($this->request->getPost("file_name"));
    }

    /* delete or undo a task */

    function delete() {

        $id = $this->request->getPost('id');
        $info = $this->Tasks_model->get_one($id);

        if (!$this->can_delete_tasks($info)) {
            app_redirect("forbidden");
        }

        if ($this->Tasks_model->delete_task_and_sub_items($id)) {
            echo json_encode(array("success" => true, 'message' => app_lang('record_deleted')));

            $task_info = $this->Tasks_model->get_one($id);

            if ($task_info->context === "project") {
                log_notification("project_task_deleted", array("project_id" => $task_info->project_id, "task_id" => $id));
            } else {
                $context_id_key = $task_info->context . "_id";
                $context_id_value = $task_info->{$task_info->context . "_id"};

                log_notification("general_task_deleted", array("$context_id_key" => $context_id_value, "task_id" => $id));
            }

            try {
                app_hooks()->do_action("app_hook_data_delete", array(
                    "id" => $id,
                    "table" => get_db_prefix() . "tasks",
                    "table_without_prefix" => "tasks",
                ));
            } catch (\Exception $ex) {
                log_message('error', '[ERROR] {exception}', ['exception' => $ex]);
            }
        } else {
            echo json_encode(array("success" => false, 'message' => app_lang('record_cannot_be_deleted')));
        }
    }

    private function _get_collaborators($collaborator_list, $clickable = true) {
        $collaborators = "";
        if ($collaborator_list) {

            $collaborators_array = explode(",", $collaborator_list);
            foreach ($collaborators_array as $collaborator) {
                $collaborator_parts = explode("--::--", $collaborator);

                $collaborator_id = get_array_value($collaborator_parts, 0);
                $collaborator_name = get_array_value($collaborator_parts, 1);

                $image_url = get_avatar(get_array_value($collaborator_parts, 2));
                $user_type = get_array_value($collaborator_parts, 3);

                $collaboratr_image = "<span class='avatar avatar-xs mr10'><img src='$image_url' alt='...'></span>";

                if ($clickable) {
                    if ($user_type == "staff") {
                        $collaborators .= get_team_member_profile_link($collaborator_id, $collaboratr_image, array("title" => $collaborator_name));
                    } else if ($user_type == "client") {
                        $collaborators .= get_client_contact_profile_link($collaborator_id, $collaboratr_image, array("title" => $collaborator_name));
                    }
                } else {
                    $collaborators .= "<span title='$collaborator_name'>$collaboratr_image</span>";
                }
            }
        }
        return $collaborators;
    }

    //parent task can't be marked as done if there is any sub task which is not done yet
    private function check_sub_tasks_statuses($status_id = 0, $parent_task_id = 0) {
        if ($status_id !== "3") {
            //parent task isn't marking as done
            return true;
        }

        $sub_tasks = $this->Tasks_model->get_details(array("parent_task_id" => $parent_task_id, "deleted" => 0))->getResult();

        foreach ($sub_tasks as $sub_task) {
            if ($sub_task->status_id !== "3") {
                //this sub task isn't done yet, show error and exit
                echo json_encode(array("success" => false, 'message' => app_lang("parent_task_completing_error_message")));
                exit();
            }
        }
    }

    private function _make_checklist_item_row($data = array(), $return_type = "row") {
        $checkbox_class = "checkbox-blank";
        $title_class = "";
        $is_checked_value = 1;
        $title_value = link_it($data->title);

        if ($data->is_checked == 1) {
            $is_checked_value = 0;
            $checkbox_class = "checkbox-checked";
            $title_class = "text-line-through text-off";
            $title_value = $data->title;
        }

        $status = js_anchor("<span class='$checkbox_class mr15 float-start'></span>", array('title' => "", "data-id" => $data->id, "data-value" => $is_checked_value, "data-act" => "update-checklist-item-status-checkbox"));
        if (!$this->can_edit_tasks($data->task_id)) {
            $status = "";
        }

        $title = "<span class='font-13 $title_class'>" . $title_value . "</span>";

        $delete = ajax_anchor(get_uri("tasks/delete_checklist_item/$data->id"), "<div class='float-end'><i data-feather='x' class='icon-16'></i></div>", array("class" => "delete-checklist-item", "title" => app_lang("delete_checklist_item"), "data-fade-out-on-success" => "#checklist-item-row-$data->id"));
        if (!$this->can_edit_tasks($data->task_id)) {
            $delete = "";
        }

        if ($return_type == "data") {
            return $status . $delete . $title;
        }

        return "<div id='checklist-item-row-$data->id' class='list-group-item mb5 checklist-item-row b-a rounded text-break' data-id='$data->id'>" . $status . $delete . $title . "</div>";
    }

    private function _make_sub_task_row($data, $return_type = "row") {

        $checkbox_class = "checkbox-blank";
        $title_class = "";

        if ($data->status_key_name == "done") {
            $checkbox_class = "checkbox-checked";
            $title_class = "text-line-through text-off";
        }

        $status = "";
        if ($this->can_edit_tasks($data)) {
            $status = js_anchor("<span class='$checkbox_class mr15 float-start'></span>", array('title' => "", "data-id" => $data->id, "data-value" => $data->status_key_name === "done" ? "1" : "3", "data-act" => "update-sub-task-status-checkbox"));
        }

        $title = anchor(get_uri("tasks/view/$data->id"), $data->title, array("class" => "font-13", "target" => "_blank"));

        $status_label = "<span class='float-end'><span class='badge mt0' style='background: $data->status_color;'>" . ($data->status_key_name ? app_lang($data->status_key_name) : $data->status_title) . "</span></span>";

        if ($return_type == "data") {
            return $status . $title . $status_label;
        }

        return "<div class='list-group-item mb5 b-a rounded sub-task-row' data-id='$data->id'>" . $status . $title . $status_label . "</div>";
    }

    function view($task_id = 0) {
        validate_numeric_value($task_id);
        $view_type = "";

        if ($task_id) { //details page
            $view_type = "details";
        } else { //modal view
            $task_id = $this->request->getPost('id');
        }

        $model_info = $this->Tasks_model->get_details(array("id" => $task_id))->getRow();
        if (!$model_info || !$model_info->id) {
            show_404();
        }

        $this->init_project_settings($model_info->project_id);

        if (!$this->can_view_tasks("", 0, $model_info)) {
            app_redirect("forbidden");
        }

        if ($model_info->context == "project" && $this->has_all_projects_restricted_role()) {
            app_redirect("forbidden");
        }

        $context_id_key = $model_info->context . "_id";

        $view_data = $this->_get_task_related_dropdowns($model_info->context, $model_info->$context_id_key, true);

        $view_data['show_assign_to_dropdown'] = true;
        if ($this->login_user->user_type == "client" && !get_setting("client_can_assign_tasks")) {
            $view_data['show_assign_to_dropdown'] = false;
        }

        $view_data['can_edit_tasks'] = $this->can_edit_tasks($model_info);
        $view_data['can_edit_task_status'] = $this->_can_edit_task_status($model_info);

        $view_data['can_comment_on_tasks'] = $this->_can_comment_on_tasks($model_info);

        $view_data['model_info'] = $model_info;
        $view_data['collaborators'] = $this->_get_collaborators($model_info->collaborator_list, false);

        $view_data['labels'] = make_labels_view_data($model_info->labels_list);

        $options = array("task_id" => $task_id, "login_user_id" => $this->login_user->id);
        $view_data['comments'] = $this->Project_comments_model->get_details($options)->getResult();
        $view_data['task_id'] = $task_id;

        $view_data['custom_fields_list'] = $this->Custom_fields_model->get_combined_details("tasks", $task_id, $this->login_user->is_admin, $this->login_user->user_type)->getResult();

        $view_data['pinned_comments'] = $this->Pin_comments_model->get_details(array("task_id" => $task_id, "pinned_by" => $this->login_user->id))->getResult();

        //get checklist items
        $checklist_items_array = array();
        $checklist_items = $this->Checklist_items_model->get_details(array("task_id" => $task_id))->getResult();
        foreach ($checklist_items as $checklist_item) {
            $checklist_items_array[] = $this->_make_checklist_item_row($checklist_item);
        }
        $view_data["checklist_items"] = json_encode($checklist_items_array);

        //get sub tasks
        $sub_tasks_array = array();
        $sub_tasks = $this->Tasks_model->get_details(array("parent_task_id" => $task_id))->getResult();
        foreach ($sub_tasks as $sub_task) {
            $sub_tasks_array[] = $this->_make_sub_task_row($sub_task);
        }
        $view_data["sub_tasks"] = json_encode($sub_tasks_array);
        $view_data["total_sub_tasks"] = $this->Tasks_model->count_sub_task_status(array("parent_task_id" => $task_id));
        $view_data["completed_sub_tasks"] = $this->Tasks_model->count_sub_task_status(array("parent_task_id" => $task_id, "status_id" => 3));

        $view_data["show_timer"] = get_setting("module_project_timesheet") ? true : false;

        if ($this->login_user->user_type === "client") {
            $view_data["show_timer"] = false;
        }

        //disable the start timer button if user has any timer in this project or if it's an another project and the setting is disabled
        $view_data["disable_timer"] = false;
        $user_has_any_timer = $this->Timesheets_model->user_has_any_timer($this->login_user->id);
        if ($user_has_any_timer && !get_setting("users_can_start_multiple_timers_at_a_time")) {
            $view_data["disable_timer"] = true;
        }

        $timer = $this->Timesheets_model->get_task_timer_info($task_id, $this->login_user->id)->getRow();
        if ($timer) {
            $view_data['timer_status'] = "open";
        } else {
            $view_data['timer_status'] = "";
        }

        $view_data['project_id'] = $model_info->project_id;

        $view_data['can_create_tasks'] = $this->can_create_tasks($model_info->context); //for sub task cration. context should be same. 

        $view_data['parent_task_title'] = $this->Tasks_model->get_one($model_info->parent_task_id)->title;

        $view_data["view_type"] = $view_type;

        $view_data["blocked_by"] = $this->_make_dependency_tasks_view_data($this->_get_all_dependency_for_this_task_specific($model_info->blocked_by, $task_id, "blocked_by"), $task_id, "blocked_by");
        $view_data["blocking"] = $this->_make_dependency_tasks_view_data($this->_get_all_dependency_for_this_task_specific($model_info->blocking, $task_id, "blocking"), $task_id, "blocking");

        $view_data["project_deadline"] = $this->_get_project_deadline_for_task($model_info->project_id);

        //count total worked hours in a task
        $timesheet_options = array("project_id" => $model_info->project_id, "task_id" => $model_info->id);

        //get allowed member ids
        $members = $this->_get_members_to_manage_timesheet();
        if ($members != "all" && $this->login_user->user_type == "staff") {
            //if user has permission to access all members, query param is not required
            //client can view all timesheet
            $timesheet_options["allowed_members"] = $members;
        }

        $info = $this->Timesheets_model->count_total_time($timesheet_options);
        $view_data["total_task_hours"] = convert_seconds_to_time_format($info->timesheet_total);
        $view_data["show_timesheet_info"] = $this->can_view_timesheet($model_info->project_id);
        $view_data["show_time_with_task"] = (get_setting("show_time_with_task_start_date_and_deadline")) ? true : false;

        $view_data['contexts'] = $this->_get_accessible_contexts();

        if ($view_type == "details") {
            return $this->template->rander('tasks/view', $view_data);
        } else {
            return $this->template->view('tasks/view', $view_data);
        }
    }

    private function _make_dependency_tasks_view_data($task_ids = "", $task_id = 0, $type = "") {
        if ($task_ids) {
            $tasks = "";

            $tasks_list = $this->Tasks_model->get_details(array("task_ids" => $task_ids))->getResult();

            foreach ($tasks_list as $task) {
                $tasks .= $this->_make_dependency_tasks_row_data($task, $task_id, $type);
            }

            return $tasks;
        }
    }

    private function _make_dependency_tasks_row_data($task_info, $task_id, $type) {
        $tasks = "";

        $tasks .= "<div id='dependency-task-row-$task_info->id' class='list-group-item mb5 dependency-task-row b-a rounded' style='border-left: 5px solid $task_info->status_color !important;'>";

        if ($this->can_edit_tasks($task_info)) {
            $tasks .= ajax_anchor(get_uri("tasks/delete_dependency_task/$task_info->id/$task_id/$type"), "<div class='float-end'><i data-feather='x' class='icon-16'></i></div>", array("class" => "delete-dependency-task", "title" => app_lang("delete"), "data-fade-out-on-success" => "#dependency-task-row-$task_info->id", "data-dependency-type" => $type));
        }

        $tasks .= modal_anchor(get_uri("tasks/view"), $task_info->title, array("data-post-id" => $task_info->id, "data-modal-lg" => "1"));

        $tasks .= "</div>";

        return $tasks;
    }

    private function _get_all_dependency_for_this_task_specific($task_ids = "", $task_id = 0, $type = "") {
        if ($task_id && $type) {
            //find the other tasks dependency with this task
            $dependency_tasks = $this->Tasks_model->get_all_dependency_for_this_task($task_id, $type);

            if ($dependency_tasks) {
                if ($task_ids) {
                    $task_ids .= "," . $dependency_tasks;
                } else {
                    $task_ids = $dependency_tasks;
                }
            }

            return $task_ids;
        }
    }

    function delete_dependency_task($dependency_task_id, $task_id, $type) {
        validate_numeric_value($dependency_task_id);
        validate_numeric_value($task_id);
        $task_info = $this->Tasks_model->get_one($task_id);

        if (!$this->can_edit_tasks($task_info)) {
            app_redirect("forbidden");
        }

        //the dependency task could be resided in both place
        //so, we've to search on both        
        $dependency_tasks_of_own = $task_info->$type;
        if ($type == "blocked_by") {
            $dependency_tasks_of_others = $this->Tasks_model->get_one($dependency_task_id)->blocking;
        } else {
            $dependency_tasks_of_others = $this->Tasks_model->get_one($dependency_task_id)->blocked_by;
        }

        //first check if it contains only a single task
        if (!strpos($dependency_tasks_of_own, ',') && $dependency_tasks_of_own == $dependency_task_id) {
            $data = array($type => "");
            $this->Tasks_model->update_custom_data($data, $task_id);
        } else if (!strpos($dependency_tasks_of_others, ',') && $dependency_tasks_of_others == $task_id) {
            $data = array((($type == "blocked_by") ? "blocking" : "blocked_by") => "");
            $this->Tasks_model->update_custom_data($data, $dependency_task_id);
        } else {
            //have multiple values
            $dependency_tasks_of_own_array = explode(',', $dependency_tasks_of_own);
            $dependency_tasks_of_others_array = explode(',', $dependency_tasks_of_others);

            if (in_array($dependency_task_id, $dependency_tasks_of_own_array)) {
                unset($dependency_tasks_of_own_array[array_search($dependency_task_id, $dependency_tasks_of_own_array)]);
                $dependency_tasks_of_own_array = implode(',', $dependency_tasks_of_own_array);
                $data = array($type => $dependency_tasks_of_own_array);
                $this->Tasks_model->update_custom_data($data, $task_id);
            } else if (in_array($task_id, $dependency_tasks_of_others_array)) {
                unset($dependency_tasks_of_others_array[array_search($task_id, $dependency_tasks_of_others_array)]);
                $dependency_tasks_of_others_array = implode(',', $dependency_tasks_of_others_array);
                $data = array((($type == "blocked_by") ? "blocking" : "blocked_by") => $dependency_tasks_of_others_array);
                $this->Tasks_model->update_custom_data($data, $dependency_task_id);
            }
        }

        echo json_encode(array("success" => true));
    }

    /* checklist */

    function save_checklist_item() {

        $task_id = $this->request->getPost("task_id");
        $is_checklist_group = $this->request->getPost("is_checklist_group");

        $this->validate_submitted_data(array(
            "task_id" => "required|numeric"
        ));

        $task_info = $this->Tasks_model->get_one($task_id);

        if ($task_id) {
            if (!$this->can_edit_tasks($task_info)) {
                app_redirect("forbidden");
            }
        }

        $success_data = "";
        if ($is_checklist_group) {
            $checklist_group_id = $this->request->getPost("checklist-add-item");
            $checklists = $this->Checklist_template_model->get_details(array("group_id" => $checklist_group_id))->getResult();
            foreach ($checklists as $checklist) {
                $data = array(
                    "task_id" => $task_id,
                    "title" => $checklist->title
                );
                $save_id = $this->Checklist_items_model->ci_save($data);
                if ($save_id) {
                    $item_info = $this->Checklist_items_model->get_details(array("id" => $save_id))->getRow();
                    $success_data .= $this->_make_checklist_item_row($item_info);
                }
            }
        } else {
            $data = array(
                "task_id" => $task_id,
                "title" => $this->request->getPost("checklist-add-item")
            );
            $save_id = $this->Checklist_items_model->ci_save($data);
            if ($save_id) {
                $item_info = $this->Checklist_items_model->get_details(array("id" => $save_id))->getRow();
                $success_data = $this->_make_checklist_item_row($item_info);
            }
        }

        if ($success_data) {
            echo json_encode(array("success" => true, "data" => $success_data, 'id' => $save_id));
        } else {
            echo json_encode(array("success" => false));
        }
    }

    function save_checklist_item_status($id = 0) {
        $task_id = $this->Checklist_items_model->get_one($id)->task_id;

        $task_info = $this->Tasks_model->get_one($task_id);

        if (!$this->can_edit_tasks($task_info)) {
            app_redirect("forbidden");
        }

        $data = array(
            "is_checked" => $this->request->getPost('value')
        );

        $save_id = $this->Checklist_items_model->ci_save($data, $id);

        if ($save_id) {
            $item_info = $this->Checklist_items_model->get_details(array("id" => $save_id))->getRow();
            echo json_encode(array("success" => true, "data" => $this->_make_checklist_item_row($item_info, "data"), 'id' => $save_id));
        } else {
            echo json_encode(array("success" => false));
        }
    }

    function save_checklist_items_sort() {
        $sort_values = $this->request->getPost("sort_values");
        if ($sort_values) {
            //extract the values from the comma separated string
            $sort_array = explode(",", $sort_values);

            //update the value in db
            foreach ($sort_array as $value) {
                $sort_item = explode("-", $value); //extract id and sort value

                $id = get_array_value($sort_item, 0);
                $sort = get_array_value($sort_item, 1);

                validate_numeric_value($id);

                $data = array("sort" => $sort);
                $this->Checklist_items_model->ci_save($data, $id);
            }
        }
    }

    function delete_checklist_item($id) {

        $task_id = $this->Checklist_items_model->get_one($id)->task_id;

        if ($id) {
            if (!$this->can_edit_tasks($task_id)) {
                app_redirect("forbidden");
            }
        }

        if ($this->Checklist_items_model->delete($id)) {
            echo json_encode(array("success" => true));
        } else {
            echo json_encode(array("success" => false));
        }
    }

    //load global gantt view
    function all_gantt() {
        $this->access_only_team_members();

        if ($this->has_all_projects_restricted_role()) {
            app_redirect("forbidden");
        }

        //only admin/ the user has permission to manage all projects, can see all projects, other team mebers can see only their own projects.
        $options = array("status" => "open");
        if (!$this->can_manage_all_projects()) {
            $options["user_id"] = $this->login_user->id;
        }

        $projects = $this->Projects_model->get_details($options)->getResult();

        //get projects dropdown
        $projects_dropdown = array(array("id" => "", "text" => "- " . app_lang("project") . " -"));
        foreach ($projects as $project) {
            $projects_dropdown[] = array("id" => $project->id, "text" => $project->title);
        }

        $view_data['projects_dropdown'] = json_encode($projects_dropdown);

        $project_id = 0;
        $view_data['project_id'] = $project_id;

        //prepare members list
        $view_data['milestone_dropdown'] = $this->_get_milestones_dropdown_list($project_id);
        $view_data["show_milestone_info"] = $this->can_view_milestones();

        $team_members_dropdown = array(array("id" => "", "text" => "- " . app_lang("assigned_to") . " -"));
        $assigned_to_list = $this->Users_model->get_dropdown_list(array("first_name", "last_name"), "id", array("deleted" => 0, "user_type" => "staff"));
        foreach ($assigned_to_list as $key => $value) {
            $team_members_dropdown[] = array("id" => $key, "text" => $value);
        }

        $view_data['project_members_dropdown'] = json_encode($team_members_dropdown);

        $view_data['show_project_members_dropdown'] = true;
        if ($this->login_user->user_type == "client") {
            $view_data['show_project_members_dropdown'] = false;
        }

        $view_data['status_dropdown'] = $this->_get_task_statuses_dropdown($project_id);
        $view_data['show_tasks_tab'] = true;
        $view_data["has_all_projects_restricted_role"] = $this->has_all_projects_restricted_role();

        return $this->template->rander("projects/gantt/index", $view_data);
    }

    function save_dependency_tasks() {
        $task_id = $this->request->getPost("task_id");
        if (!$task_id) {
            return false;
        }

        $dependency_task = $this->request->getPost("dependency_task");
        $dependency_type = $this->request->getPost("dependency_type");

        if (!$dependency_task) {
            return false;
        }

        //add the new task with old
        $task_info = $this->Tasks_model->get_one($task_id);

        if (!$this->can_edit_tasks($task_info)) {
            app_redirect("forbidden");
        }

        $dependency_tasks = $task_info->$dependency_type;
        if ($dependency_tasks) {
            $dependency_tasks .= "," . $dependency_task;
        } else {
            $dependency_tasks = $dependency_task;
        }

        $data = array(
            $dependency_type => $dependency_tasks
        );

        $data = clean_data($data);

        $this->Tasks_model->update_custom_data($data, $task_id);
        $dependency_task_info = $this->Tasks_model->get_details(array("id" => $dependency_task))->getRow();

        echo json_encode(array("success" => true, "data" => $this->_make_dependency_tasks_row_data($dependency_task_info, $task_id, $dependency_type), 'message' => app_lang('record_saved')));
    }

    private function _get_all_dependency_for_this_task($task_id) {
        $task_info = $this->Tasks_model->get_one($task_id);
        $blocked_by = $this->_get_all_dependency_for_this_task_specific($task_info->blocked_by, $task_id, "blocked_by");
        $blocking = $this->_get_all_dependency_for_this_task_specific($task_info->blocking, $task_id, "blocking");

        $all_tasks = $blocked_by;
        if ($blocking) {
            if ($all_tasks) {
                $all_tasks .= "," . $blocking;
            } else {
                $all_tasks = $blocking;
            }
        }

        return $all_tasks;
    }

    function get_existing_dependency_tasks($task_id = 0) {
        if ($task_id) {
            validate_numeric_value($task_id);
            $model_info = $this->Tasks_model->get_details(array("id" => $task_id))->getRow();

            if (!$this->can_view_tasks("", 0, $model_info)) {
                app_redirect("forbidden");
            }

            $all_dependency_tasks = $this->_get_all_dependency_for_this_task($task_id);

            //add this task id
            if ($all_dependency_tasks) {
                $all_dependency_tasks .= "," . $task_id;
            } else {
                $all_dependency_tasks = $task_id;
            }

            //make tasks dropdown
            $options = array("exclude_task_ids" => $all_dependency_tasks);

            $context_id_pairs = $this->get_context_id_pairs();

            foreach ($context_id_pairs as $pair) {
                $id_key = get_array_value($pair, "id_key");
                $options[$id_key] = $model_info->$id_key;
            }


            $tasks_dropdown = array();
            $tasks = $this->Tasks_model->get_details($options)->getResult();
            foreach ($tasks as $task) {
                $tasks_dropdown[] = array("id" => $task->id, "text" => $task->id . " - " . $task->title);
            }

            echo json_encode(array("success" => true, "tasks_dropdown" => $tasks_dropdown));
        }
    }

    function save_gantt_task_date() {
        $task_id = $this->request->getPost("task_id");
        if (!$task_id) {
            show_404();
        }

        if (!$this->can_edit_tasks($task_id)) {
            app_redirect("forbidden");
        }

        $start_date = $this->request->getPost("start_date");
        $deadline = $this->request->getPost("deadline");

        $data = array(
            "start_date" => $start_date,
            "deadline" => $deadline,
        );

        $save_id = $this->Tasks_model->save_gantt_task_date($data, $task_id);
        if ($save_id) {

            /* Send notification
              $activity_log_id = get_array_value($data, "activity_log_id");

              $new_activity_log_id = save_custom_fields("tasks", $save_id, $this->login_user->is_admin, $this->login_user->user_type, $activity_log_id);

              log_notification("project_task_updated", array("project_id" => $task_info->project_id, "task_id" => $save_id, "activity_log_id" => $new_activity_log_id ? $new_activity_log_id : $activity_log_id));
             */

            echo json_encode(array("success" => true));
        } else {
            echo json_encode(array("success" => false, 'message' => app_lang('error_occurred')));
        }
    }

    function import_tasks_modal_form() {
        $this->access_only_team_members();
        if (!$this->can_create_tasks()) {
            app_redirect("forbidden");
        }

        return $this->template->view("tasks/import_tasks_modal_form");
    }

    function upload_excel_file() {
        upload_file_to_temp(true);
    }

    function download_sample_excel_file() {
        return $this->download_app_files(get_setting("system_file_path"), serialize(array(array("file_name" => "import-tasks-sample.xlsx"))));
    }

    function validate_import_tasks_file() {
        $file_name = $this->request->getPost("file_name");
        $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
        if (!is_valid_file_to_upload($file_name)) {
            echo json_encode(array("success" => false, 'message' => app_lang('invalid_file_type')));
            exit();
        }

        if ($file_ext == "xlsx") {
            echo json_encode(array("success" => true));
        } else {
            echo json_encode(array("success" => false, 'message' => app_lang('please_upload_a_excel_file') . " (.xlsx)"));
        }
    }

    private function _prepare_task_data($data_row, $allowed_headers) {
        //prepare task data
        $task_data = array();
        $custom_field_values_array = array();

        foreach ($data_row as $row_data_key => $row_data_value) { //row values
            if (!$row_data_value) {
                continue;
            }

            $header_key_value = get_array_value($allowed_headers, $row_data_key);
            if (strpos($header_key_value, 'cf') !== false) { //custom field
                $explode_header_key_value = explode("-", $header_key_value);
                $custom_field_id = get_array_value($explode_header_key_value, 1);

                //modify date value
                $custom_field_info = $this->Custom_fields_model->get_one($custom_field_id);
                if ($custom_field_info->field_type === "date") {
                    $row_data_value = $this->_check_valid_date($row_data_value);
                }

                $custom_field_values_array[$custom_field_id] = $row_data_value;
            } else if ($header_key_value == "project") {
                $task_data["project_id"] = $this->_get_project_id($row_data_value);
            } else if ($header_key_value == "points") {
                $task_data["points"] = $this->_check_task_points($row_data_value);
            } else if ($header_key_value == "milestone") {
                $task_data["milestone_id"] = $this->_get_milestone_id($row_data_value);
            } else if ($header_key_value == "assigned_to") {
                $task_data["assigned_to"] = $this->_get_assigned_to_id($row_data_value);
            } else if ($header_key_value == "collaborators") {
                $task_data["collaborators"] = $this->_get_collaborators_ids($row_data_value);
            } else if ($header_key_value == "status") {
                $task_data["status_id"] = $this->_get_status_id($row_data_value);
            } else if ($header_key_value == "labels") {
                $task_data["labels"] = $this->_get_label_ids($row_data_value);
            } else if ($header_key_value == "start_date") {
                $task_data["start_date"] = $this->_check_valid_date($row_data_value);
            } else if ($header_key_value == "deadline") {
                $task_data["deadline"] = $this->_check_valid_date($row_data_value);
            } else {
                $task_data[$header_key_value] = $row_data_value;
            }
        }

        return array(
            "task_data" => $task_data,
            "custom_field_values_array" => $custom_field_values_array
        );
    }

    private function _get_existing_custom_field_id($title = "") {
        if (!$title) {
            return false;
        }

        $custom_field_data = array(
            "title" => $title,
            "related_to" => "tasks"
        );

        $existing = $this->Custom_fields_model->get_one_where(array_merge($custom_field_data, array("deleted" => 0)));
        if ($existing->id) {
            return $existing->id;
        }
    }

    private function _prepare_headers_for_submit($headers_row, $headers) {
        foreach ($headers_row as $key => $header) {
            if (!((count($headers) - 1) < $key)) { //skip default headers
                continue;
            }

            //so, it's a custom field
            //check if there is any custom field existing with the title
            //add id like cf-3
            $existing_id = $this->_get_existing_custom_field_id($header);
            if ($existing_id) {
                array_push($headers, "cf-$existing_id");
            }
        }

        return $headers;
    }

    function save_task_from_excel_file() {
        $this->access_only_team_members();
        if (!$this->can_create_tasks()) {
            app_redirect("forbidden");
        }

        if (!$this->validate_import_tasks_file_data(true)) {
            echo json_encode(array('success' => false, 'message' => app_lang('error_occurred')));
        }

        $file_name = $this->request->getPost('file_name');
        require_once(APPPATH . "ThirdParty/PHPOffice-PhpSpreadsheet/vendor/autoload.php");

        $temp_file_path = get_setting("temp_file_path");
        $excel_file = \PhpOffice\PhpSpreadsheet\IOFactory::load($temp_file_path . $file_name);
        $excel_file = $excel_file->getActiveSheet()->toArray();
        $allowed_headers = $this->_get_allowed_headers();
        $now = get_current_utc_time();

        $sort = 100; //random value

        foreach ($excel_file as $key => $value) { //rows
            if ($key === 0) { //first line is headers, modify this for custom fields and continue for the next loop
                $allowed_headers = $this->_prepare_headers_for_submit($value, $allowed_headers);
                continue;
            }

            $task_data_array = $this->_prepare_task_data($value, $allowed_headers);
            $task_data = get_array_value($task_data_array, "task_data");
            $custom_field_values_array = get_array_value($task_data_array, "custom_field_values_array");

            //couldn't prepare valid data
            if (!($task_data && count($task_data))) {
                continue;
            }

            $task_data["sort"] = $sort;

            //save task data
            $task_save_id = $this->Tasks_model->ci_save($task_data);
            $sort = $task_save_id;

            if (!$task_save_id) {
                continue;
            }

            //save custom fields
            $this->_save_custom_fields_of_task($task_save_id, $custom_field_values_array);
        }

        delete_file_from_directory($temp_file_path . $file_name); //delete temp file

        echo json_encode(array('success' => true, 'message' => app_lang("record_saved")));
    }

    private function _save_custom_fields_of_task($task_id, $custom_field_values_array) {
        if (!$custom_field_values_array) {
            return false;
        }

        foreach ($custom_field_values_array as $key => $custom_field_value) {
            $field_value_data = array(
                "related_to_type" => "tasks",
                "related_to_id" => $task_id,
                "custom_field_id" => $key,
                "value" => $custom_field_value
            );

            $field_value_data = clean_data($field_value_data);

            $this->Custom_field_values_model->ci_save($field_value_data);
        }
    }

    private function _get_project_id($project = "") {
        if (!$project) {
            return false;
        }

        $existing_project = $this->Projects_model->get_one_where(array("title" => $project, "deleted" => 0));
        if ($existing_project->id) {
            //project exists, check permission to access this project
            if ($this->can_create_tasks("project")) {
                return $existing_project->id;
            }
        } else {
            return false;
        }
    }

    private function _get_milestone_id($milestone = "") {
        if (!$milestone) {
            return false;
        }

        $existing_milestone = $this->Milestones_model->get_one_where(array("title" => $milestone, "deleted" => 0));
        if ($existing_milestone->id) {
            //milestone exists, add the milestone id
            return $existing_milestone->id;
        } else {
            return false;
        }
    }

    private function _get_assigned_to_id($assigned_to = "") {
        $assigned_to = trim($assigned_to);
        if (!$assigned_to) {
            return false;
        }

        $existing_user = $this->Users_model->get_user_from_full_name($assigned_to);
        if ($existing_user) {
            return $existing_user->id;
        } else {
            return false;
        }
    }

    private function _check_task_points($points = "") {
        if (!$points) {
            return false;
        }

        if (get_setting("task_point_range") >= $points) {
            return $points;
        } else {
            return false;
        }
    }

    private function _get_collaborators_ids($collaborators_data) {
        $explode_collaborators = explode(", ", $collaborators_data);
        if (!($explode_collaborators && count($explode_collaborators))) {
            return false;
        }

        $groups_ids = "";

        foreach ($explode_collaborators as $collaborator) {
            $collaborator = trim($collaborator);

            $existing_user = $this->Users_model->get_user_from_full_name($collaborator);
            if ($existing_user) {
                //user exists, add the user id to collaborator ids
                if ($groups_ids) {
                    $groups_ids .= ",";
                }
                $groups_ids .= $existing_user->id;
            } else {
                //flag error that anyone of the list isn't exists
                return false;
            }
        }

        if ($groups_ids) {
            return $groups_ids;
        }
    }

    private function _get_status_id($status = "") {
        if (!$status) {
            return false;
        }

        $existing_status = $this->Task_status_model->get_one_where(array("title" => $status, "deleted" => 0));
        if ($existing_status->id) {
            //status exists, add the status id
            return $existing_status->id;
        } else {
            return false;
        }
    }

    private function _get_label_ids($labels = "") {
        $explode_labels = explode(", ", $labels);
        if (!($explode_labels && count($explode_labels))) {
            return false;
        }

        $labels_ids = "";

        foreach ($explode_labels as $label) {
            $label = trim($label);
            $labels_id = "";

            $existing_label = $this->Labels_model->get_one_where(array("title" => $label, "context" => "task", "deleted" => 0));
            if ($existing_label->id) {
                //existing label, add the labels id
                $labels_id = $existing_label->id;
            } else {
                //not exists, create new
                $label_data = array("title" => $label, "context" => "task", "color" => "#83c340");
                $labels_id = $this->Labels_model->ci_save($label_data);
            }

            if ($labels_ids) {
                $labels_ids .= ",";
            }
            $labels_ids .= $labels_id;
        }

        return $labels_ids;
    }

    private function _get_allowed_headers() {
        return array(
            "title",
            "description",
            "project",
            "points",
            "milestone",
            "assigned_to",
            "collaborators",
            "status",
            "labels",
            "start_date",
            "deadline"
        );
    }

    private function _store_headers_position($headers_row = array()) {
        $allowed_headers = $this->_get_allowed_headers();

        //check if all headers are correct and on the right position
        $final_headers = array();
        foreach ($headers_row as $key => $header) {
            if (!$header) {
                continue;
            }

            $key_value = str_replace(' ', '_', strtolower(trim($header, " ")));
            $header_on_this_position = get_array_value($allowed_headers, $key);
            $header_array = array("key_value" => $header_on_this_position, "value" => $header);

            if ($header_on_this_position == $key_value) {
                //allowed headers
                //the required headers should be on the correct positions
                //the rest headers will be treated as custom fields
                //pushed header at last of this loop
            } else if (((count($allowed_headers) - 1) < $key) && $key_value) {
                //custom fields headers
                //check if there is any existing custom field with this title
                $existing_id = $this->_get_existing_custom_field_id(trim($header, " "));
                if ($existing_id) {
                    $header_array["custom_field_id"] = $existing_id;
                } else {
                    $header_array["has_error"] = true;
                    $header_array["custom_field"] = true;
                }
            } else { //invalid header, flag as red
                $header_array["has_error"] = true;
            }

            if ($key_value) {
                array_push($final_headers, $header_array);
            }
        }

        return $final_headers;
    }

    function validate_import_tasks_file_data($check_on_submit = false) {
        $table_data = "";
        $error_message = "";
        $headers = array();
        $got_error_header = false; //we've to check the valid headers first, and a single header at a time
        $got_error_table_data = false;

        $file_name = $this->request->getPost("file_name");

        require_once(APPPATH . "ThirdParty/PHPOffice-PhpSpreadsheet/vendor/autoload.php");

        $temp_file_path = get_setting("temp_file_path");
        $excel_file = \PhpOffice\PhpSpreadsheet\IOFactory::load($temp_file_path . $file_name);
        $excel_file = $excel_file->getActiveSheet()->toArray();

        $table_data .= '<table class="table table-responsive table-bordered table-hover" style="width: 100%; color: #444;">';

        $table_data_header_array = array();
        $table_data_body_array = array();

        foreach ($excel_file as $row_key => $value) {
            if ($row_key == 0) { //validate headers
                $headers = $this->_store_headers_position($value);

                foreach ($headers as $row_data) {
                    $has_error_class = false;
                    if (get_array_value($row_data, "has_error") && !$got_error_header) {
                        $has_error_class = true;
                        $got_error_header = true;

                        if (get_array_value($row_data, "custom_field")) {
                            $error_message = app_lang("no_such_custom_field_found");
                        } else {
                            $error_message = sprintf(app_lang("import_client_error_header"), app_lang(get_array_value($row_data, "key_value")));
                        }
                    }

                    array_push($table_data_header_array, array("has_error_class" => $has_error_class, "value" => get_array_value($row_data, "value")));
                }
            } else { //validate data
                if (!array_filter($value)) {
                    continue;
                }

                $error_message_on_this_row = "<ol class='pl15'>";
                $has_contact_first_name = get_array_value($value, 1) ? true : false;

                foreach ($value as $key => $row_data) {
                    $has_error_class = false;

                    if (!$got_error_header) {
                        $row_data_validation = $this->_row_data_validation_and_get_error_message($key, $row_data, $has_contact_first_name, $headers);
                        if ($row_data_validation) {
                            $has_error_class = true;
                            $error_message_on_this_row .= "<li>" . $row_data_validation . "</li>";
                            $got_error_table_data = true;
                        }
                    }

                    if (count($headers) > $key) {
                        $table_data_body_array[$row_key][] = array("has_error_class" => $has_error_class, "value" => $row_data);
                    }
                }

                $error_message_on_this_row .= "</ol>";

                //error messages for this row
                if ($got_error_table_data) {
                    $table_data_body_array[$row_key][] = array("has_error_text" => true, "value" => $error_message_on_this_row);
                }
            }
        }

        //return false if any error found on submitting file
        if ($check_on_submit) {
            return ($got_error_header || $got_error_table_data) ? false : true;
        }

        //add error header if there is any error in table body
        if ($got_error_table_data) {
            array_push($table_data_header_array, array("has_error_text" => true, "value" => app_lang("error")));
        }

        //add headers to table
        $table_data .= "<tr>";
        foreach ($table_data_header_array as $table_data_header) {
            $error_class = get_array_value($table_data_header, "has_error_class") ? "error" : "";
            $error_text = get_array_value($table_data_header, "has_error_text") ? "text-danger" : "";
            $value = get_array_value($table_data_header, "value");
            $table_data .= "<th class='$error_class $error_text'>" . $value . "</th>";
        }
        $table_data .= "</tr>";

        //add body data to table
        foreach ($table_data_body_array as $table_data_body_row) {
            $table_data .= "<tr>";
            $error_text = "";

            foreach ($table_data_body_row as $table_data_body_row_data) {
                $error_class = get_array_value($table_data_body_row_data, "has_error_class") ? "error" : "";
                $error_text = get_array_value($table_data_body_row_data, "has_error_text") ? "text-danger" : "";
                $value = get_array_value($table_data_body_row_data, "value");
                $table_data .= "<td class='$error_class $error_text'>" . $value . "</td>";
            }

            if ($got_error_table_data && !$error_text) {
                $table_data .= "<td></td>";
            }

            $table_data .= "</tr>";
        }

        //add error message for header
        if ($error_message) {
            $total_columns = count($table_data_header_array);
            $table_data .= "<tr><td class='text-danger' colspan='$total_columns'><i data-feather='alert-triangle' class='icon-16'></i> " . $error_message . "</td></tr>";
        }

        $table_data .= "</table>";

        echo json_encode(array("success" => true, 'table_data' => $table_data, 'got_error' => ($got_error_header || $got_error_table_data) ? true : false));
    }

    private function _row_data_validation_and_get_error_message($key, $data, $headers = array()) {
        $allowed_headers = $this->_get_allowed_headers();
        $header_value = get_array_value($allowed_headers, $key);

        //required fields
        if (($header_value == "title" || $header_value == "project" || $header_value == "points" || $header_value == "status") && !$data) {
            return sprintf(app_lang("import_error_field_required"), app_lang($header_value));
        }

        //check dates
        if (($header_value == "start_date" || $header_value == "end_date") && !$this->_check_valid_date($data)) {
            return app_lang("import_date_error_message");
        }

        //existance required on this fields
        if ($data && (
                ($header_value == "project" && !$this->_get_project_id($data)) ||
                ($header_value == "status" && !$this->_get_status_id($data)) ||
                ($header_value == "milestone" && !$this->_get_milestone_id($data)) ||
                ($header_value == "assigned_to" && !$this->_get_assigned_to_id($data)) ||
                ($header_value == "collaborators" && !$this->_get_collaborators_ids($data))
                )) {
            if ($header_value == "assigned_to" || $header_value == "collaborators") {
                return sprintf(app_lang("import_not_exists_error_message"), app_lang("user"));
            } else {
                return sprintf(app_lang("import_not_exists_error_message"), app_lang($header_value));
            }
        }

        //valid points is required
        if ($header_value == "points" && !$this->_check_task_points($data)) {
            return app_lang("import_task_points_error_message");
        }

        //there has no date field on default import fields
        //check on custom fields
        if (((count($allowed_headers) - 1) < $key) && $data) {
            $header_info = get_array_value($headers, $key);
            $custom_field_info = $this->Custom_fields_model->get_one(get_array_value($header_info, "custom_field_id"));
            if ($custom_field_info->field_type === "date" && !$this->_check_valid_date($data)) {
                return app_lang("import_date_error_message");
            }
        }
    }

    /* load task list view tab */

    function project_tasks($project_id) {
        validate_numeric_value($project_id);

        if (!$this->can_view_tasks("project", $project_id)) {
            app_redirect("forbidden");
        }

        $this->init_project_permission_checker($project_id);

        $view_data['project_id'] = $project_id;
        $view_data['view_type'] = "project_tasks";

        $view_data['can_create_tasks'] = $this->can_create_tasks("project");
        $view_data['can_edit_tasks'] = $this->_can_edit_project_tasks($project_id);
        $view_data['can_delete_tasks'] = $this->_can_delete_project_tasks($project_id);
        $view_data["show_milestone_info"] = $this->can_view_milestones();

        $view_data['milestone_dropdown'] = $this->_get_milestones_dropdown_list($project_id);
        $view_data['priorities_dropdown'] = $this->_get_priorities_dropdown_list();
        $view_data['assigned_to_dropdown'] = $this->_get_project_members_dropdown_list($project_id);
        $view_data["custom_field_headers"] = $this->Custom_fields_model->get_custom_field_headers_for_table("tasks", $this->login_user->is_admin, $this->login_user->user_type);
        $view_data["custom_field_filters"] = $this->Custom_fields_model->get_custom_field_filters("tasks", $this->login_user->is_admin, $this->login_user->user_type);

        $exclude_status_ids = $this->get_removed_task_status_ids($project_id);
        $view_data['task_statuses'] = $this->Task_status_model->get_details(array("exclude_status_ids" => $exclude_status_ids))->getResult();

        $view_data["show_assigned_tasks_only"] = get_array_value($this->login_user->permissions, "show_assigned_tasks_only");
        $view_data['labels_dropdown'] = json_encode($this->make_labels_dropdown("task", "", true));

        return $this->template->view("projects/tasks/index", $view_data);
    }

    /* load task kanban view of view tab */

    function project_tasks_kanban($project_id) {
        validate_numeric_value($project_id);

        if (!$this->can_view_tasks("project", $project_id)) {
            app_redirect("forbidden");
        }

        $this->init_project_permission_checker($project_id);

        $view_data['project_id'] = $project_id;

        $view_data['can_create_tasks'] = $this->can_create_tasks("project");
        $view_data["show_milestone_info"] = $this->can_view_milestones();

        $view_data['milestone_dropdown'] = $this->_get_milestones_dropdown_list($project_id);
        $view_data['priorities_dropdown'] = $this->_get_priorities_dropdown_list();
        $view_data['assigned_to_dropdown'] = $this->_get_project_members_dropdown_list($project_id);

        $exclude_status_ids = $this->get_removed_task_status_ids($project_id);
        $view_data['task_statuses'] = $this->Task_status_model->get_details(array("exclude_status_ids" => $exclude_status_ids))->getResult();
        $view_data['can_edit_tasks'] = $this->_can_edit_project_tasks($project_id);
        $view_data["custom_field_filters"] = $this->Custom_fields_model->get_custom_field_filters("tasks", $this->login_user->is_admin, $this->login_user->user_type);
        $view_data['labels_dropdown'] = json_encode($this->make_labels_dropdown("task", "", true));

        return $this->template->view("projects/tasks/kanban/project_tasks", $view_data);
    }

    private function _get_milestones_dropdown_list($project_id = 0) {
        $milestones = $this->Milestones_model->get_details(array("project_id" => $project_id, "deleted" => 0))->getResult();
        $milestone_dropdown = array(array("id" => "", "text" => "- " . app_lang("milestone") . " -"));

        foreach ($milestones as $milestone) {
            $milestone_dropdown[] = array("id" => $milestone->id, "text" => $milestone->title);
        }
        return json_encode($milestone_dropdown);
    }

    private function _get_priorities_dropdown_list($priority_id = 0) {
        $priorities = $this->Task_priority_model->get_details()->getResult();
        $priorities_dropdown = array(array("id" => "", "text" => "- " . app_lang("priority") . " -"));

        //if there is any specific priority selected, select only the priority.
        $selected_status = false;
        foreach ($priorities as $priority) {
            if (isset($priority_id) && $priority_id) {
                if ($priority->id == $priority_id) {
                    $selected_status = true;
                } else {
                    $selected_status = false;
                }
            }

            $priorities_dropdown[] = array("id" => $priority->id, "text" => $priority->title, "isSelected" => $selected_status);
        }
        return json_encode($priorities_dropdown);
    }

    private function _get_project_members_dropdown_list($project_id = 0) {
        if ($this->login_user->user_type === "staff") {
            $assigned_to_dropdown = array(array("id" => "", "text" => "- " . app_lang("assigned_to") . " -"));
            $assigned_to_list = $this->Project_members_model->get_project_members_dropdown_list($project_id, array(), true, true)->getResult();
            foreach ($assigned_to_list as $assigned_to) {
                $assigned_to_dropdown[] = array("id" => $assigned_to->user_id, "text" => $assigned_to->member_name);
            }
        } else {
            $assigned_to_dropdown = array(
                array("id" => "", "text" => app_lang("all_tasks")),
                array("id" => $this->login_user->id, "text" => app_lang("my_tasks"))
            );
        }

        return json_encode($assigned_to_dropdown);
    }

    function all_tasks($tab = "", $status_id = 0, $priority_id = 0, $type = "") {
        $this->access_only_team_members();
        $view_data['project_id'] = 0;
        $projects = $this->Tasks_model->get_my_projects_dropdown_list($this->login_user->id)->getResult();
        $projects_dropdown = array(array("id" => "", "text" => "- " . app_lang("project") . " -"));
        foreach ($projects as $project) {
            if ($project->project_id && $project->project_title) {
                $projects_dropdown[] = array("id" => $project->project_id, "text" => $project->project_title);
            }
        }

        $team_members_dropdown = array(array("id" => "", "text" => "- " . app_lang("team_member") . " -"));
        $assigned_to_list = $this->Users_model->get_dropdown_list(array("first_name", "last_name"), "id", array("deleted" => 0, "user_type" => "staff"));
        foreach ($assigned_to_list as $key => $value) {

            if (($status_id || $priority_id) && $type != "my_tasks_overview") {
                $team_members_dropdown[] = array("id" => $key, "text" => $value);
            } else {
                if ($key == $this->login_user->id) {
                    $team_members_dropdown[] = array("id" => $key, "text" => $value, "isSelected" => true);
                } else {
                    $team_members_dropdown[] = array("id" => $key, "text" => $value);
                }
            }
        }

        $view_data['tab'] = $tab;
        $view_data['selected_status_id'] = $status_id;
        $view_data['selected_priority_id'] = $priority_id;

        $view_data['team_members_dropdown'] = json_encode($team_members_dropdown);
        $view_data["custom_field_headers"] = $this->Custom_fields_model->get_custom_field_headers_for_table("tasks", $this->login_user->is_admin, $this->login_user->user_type);
        $view_data["custom_field_filters"] = $this->Custom_fields_model->get_custom_field_filters("tasks", $this->login_user->is_admin, $this->login_user->user_type);

        $view_data['task_statuses'] = $this->Task_status_model->get_details()->getResult();

        $view_data['projects_dropdown'] = json_encode($projects_dropdown);
        $view_data['can_create_tasks'] = $this->can_create_tasks();
        $view_data['priorities_dropdown'] = $this->_get_priorities_dropdown_list($priority_id);
        $view_data['contexts_dropdown'] = json_encode($this->_get_accessible_contexts_dropdown());
        $view_data["has_all_projects_restricted_role"] = $this->has_all_projects_restricted_role();
        $view_data['labels_dropdown'] = json_encode($this->make_labels_dropdown("task", "", true));

        return $this->template->rander("tasks/all_tasks", $view_data);
    }

    function _get_accessible_contexts_dropdown($type = "view") {
        $contexts = $this->_get_accessible_contexts($type);

        $contexts_dropdown = array(array("id" => "", "text" => "- " . app_lang("related_to") . " -"));

        foreach ($contexts as $context) {

            $contexts_dropdown[] = array("id" => $context, "text" => app_lang($context));
        }

        return $contexts_dropdown;
    }

    function all_tasks_kanban() {

        $projects = $this->Tasks_model->get_my_projects_dropdown_list($this->login_user->id)->getResult();
        $projects_dropdown = array(array("id" => "", "text" => "- " . app_lang("project") . " -"));
        foreach ($projects as $project) {
            if ($project->project_id && $project->project_title) {
                $projects_dropdown[] = array("id" => $project->project_id, "text" => $project->project_title);
            }
        }

        $team_members_dropdown = array(array("id" => "", "text" => "- " . app_lang("team_member") . " -"));
        $assigned_to_list = $this->Users_model->get_dropdown_list(array("first_name", "last_name"), "id", array("deleted" => 0, "user_type" => "staff"));
        foreach ($assigned_to_list as $key => $value) {

            if ($key == $this->login_user->id) {
                $team_members_dropdown[] = array("id" => $key, "text" => $value, "isSelected" => true);
            } else {
                $team_members_dropdown[] = array("id" => $key, "text" => $value);
            }
        }

        $view_data['team_members_dropdown'] = json_encode($team_members_dropdown);
        $view_data['priorities_dropdown'] = $this->_get_priorities_dropdown_list();

        $view_data['projects_dropdown'] = json_encode($projects_dropdown);
        $view_data['can_create_tasks'] = $this->can_create_tasks();

        $view_data['task_statuses'] = $this->Task_status_model->get_details()->getResult();
        $view_data["custom_field_filters"] = $this->Custom_fields_model->get_custom_field_filters("tasks", $this->login_user->is_admin, $this->login_user->user_type);
        $view_data['contexts_dropdown'] = json_encode($this->_get_accessible_contexts_dropdown());
        $view_data["has_all_projects_restricted_role"] = $this->has_all_projects_restricted_role();
        $view_data['labels_dropdown'] = json_encode($this->make_labels_dropdown("task", "", true));

        return $this->template->rander("tasks/kanban/all_tasks", $view_data);
    }

    //check user's task editting permission on changing of project
    function can_edit_task_of_the_project($project_id = 0) {
        validate_numeric_value($project_id);
        if ($project_id) {

            if ($this->_can_edit_project_tasks($project_id)) {
                echo json_encode(array("success" => true));
            } else {
                echo json_encode(array("success" => false));
            }
        }
    }

    function all_tasks_kanban_data() {

        $this->access_only_team_members();

        $project_id = $this->request->getPost('project_id');

        $specific_user_id = $this->request->getPost('specific_user_id');

        $options = array(
            "specific_user_id" => $specific_user_id,
            "project_id" => $project_id,
            "milestone_id" => $this->request->getPost('milestone_id'),
            "priority_id" => $this->request->getPost('priority_id'),
            "deadline" => $this->request->getPost('deadline'),
            "search" => $this->request->getPost('search'),
            "context" => $this->request->getPost('context'),
            "unread_status_user_id" => $this->login_user->id,
            "quick_filter" => $this->request->getPost("quick_filter"),
            "label_id" => $this->request->getPost('label_id'),
            "custom_field_filter" => $this->prepare_custom_field_filter_values("tasks", $this->login_user->is_admin, $this->login_user->user_type)
        );

        $view_data['can_edit_project_tasks'] = $this->_can_edit_project_tasks($project_id);
        $view_data['project_id'] = $project_id;

        //prepare accessible query parameters
        $contexts = $this->_get_accessible_contexts("view");
        $options = array_merge($options, $this->_prepare_query_parameters_for_accessible_contexts($contexts));

        if (count($contexts) == 0) {
            //don't show anything 
            $options["context"] = "noting";
        }

        $max_sort = $this->request->getPost('max_sort');
        $column_id = $this->request->getPost('kanban_column_id');

        if ($column_id) {
            //load only signle column data. load more.. 
            $options["get_after_max_sort"] = $max_sort;
            $options["status_id"] = $column_id;
            $options["limit"] = 100;

            $view_data["tasks"] = $this->Tasks_model->get_kanban_details($options)->getResult();
            $tasks_edit_permissions = $this->_get_tasks_status_edit_permissions($view_data["tasks"]);
            $view_data["tasks_edit_permissions"] = $tasks_edit_permissions;
            return $this->template->view('tasks/kanban/kanban_column_items', $view_data);
        } else {
            $task_count_query_options = $options;
            $task_count_query_options["return_task_counts_only"] = true;
            $task_counts = $this->Tasks_model->get_kanban_details($task_count_query_options)->getResult();
            $column_tasks_count = array();
            foreach ($task_counts as $task_count) {
                $column_tasks_count[$task_count->status_id] = $task_count->tasks_count;
            }

            $exclude_status_ids = $this->get_removed_task_status_ids($project_id);
            $task_status_options = array("hide_from_kanban" => 0, "exclude_status_ids" => $exclude_status_ids);
            if (!$project_id) {
                $task_status_options["hide_from_non_project_related_tasks"] = 0;
            }
            $statuses = $this->Task_status_model->get_details($task_status_options);

            $view_data["total_columns"] = $statuses->resultID->num_rows;
            $columns = $statuses->getResult();

            $tasks_list = array();
            $tasks_edit_permissions_list = array();

            foreach ($columns as $column) {
                $status_id = $column->id;

                //find the tasks if there is any task
                if (get_array_value($column_tasks_count, $status_id)) {
                    $options["status_id"] = $status_id;
                    $options["limit"] = 15;

                    $tasks = $this->Tasks_model->get_kanban_details($options)->getResult();
                    $tasks_list[$status_id] = $tasks;
                    $tasks_edit_permissions_list[$status_id] = $this->_get_tasks_status_edit_permissions($tasks);
                }
            }
            $view_data["tasks_edit_permissions_list"] = $tasks_edit_permissions_list;
            $view_data["columns"] = $columns;
            $view_data['column_tasks_count'] = $column_tasks_count;
            $view_data['tasks_list'] = $tasks_list;

            return $this->template->view('tasks/kanban/kanban_view', $view_data);
        }
    }

    private function _get_tasks_edit_permissions($tasks = array()) {

        $permissions = array();
        foreach ($tasks as $task_info) {
            $permissions[$task_info->id] = $this->can_edit_tasks($task_info);
        }
        return $permissions;
    }

    private function _get_tasks_status_edit_permissions($tasks = array(), $tasks_edit_permissions = array()) {
        $permissions = array();
        foreach ($tasks as $task_info) {
            if (get_array_value($tasks_edit_permissions, $task_info->id)) {
                $permissions[$task_info->id] = true; //to reduce load, check already checking data. If user has permission to edit, he/she can update the status also. 
            } else {
                $permissions[$task_info->id] = $this->_can_edit_task_status($task_info);
            }
        }
        return $permissions;
    }

    /* prepare data for the project view's kanban tab  */

    function project_tasks_kanban_data($project_id = 0) {
        validate_numeric_value($project_id);

        if (!$this->can_view_tasks("project", $project_id)) {
            app_redirect("forbidden");
        }

        $specific_user_id = $this->request->getPost('specific_user_id');

        $options = array(
            "specific_user_id" => $specific_user_id,
            "project_id" => $project_id,
            "assigned_to" => $this->request->getPost('assigned_to'),
            "milestone_id" => $this->request->getPost('milestone_id'),
            "priority_id" => $this->request->getPost('priority_id'),
            "deadline" => $this->request->getPost('deadline'),
            "search" => $this->request->getPost('search'),
            "unread_status_user_id" => $this->login_user->id,
            "show_assigned_tasks_only_user_id" => $this->show_assigned_tasks_only_user_id(),
            "quick_filter" => $this->request->getPost('quick_filter'),
            "label_id" => $this->request->getPost('label_id'),
            "custom_field_filter" => $this->prepare_custom_field_filter_values("tasks", $this->login_user->is_admin, $this->login_user->user_type)
        );

        $view_data['can_edit_project_tasks'] = $this->_can_edit_project_tasks($project_id);
        $view_data['project_id'] = $project_id;

        $max_sort = $this->request->getPost('max_sort');
        $column_id = $this->request->getPost('kanban_column_id');

        if ($column_id) {
            //load only signle column data. load more.. 
            $options["get_after_max_sort"] = $max_sort;
            $options["status_id"] = $column_id;
            $options["limit"] = 100;
            $view_data["tasks"] = $this->Tasks_model->get_kanban_details($options)->getResult();
            $tasks_edit_permissions = $this->_get_tasks_status_edit_permissions($view_data["tasks"]);
            $view_data["tasks_edit_permissions"] = $tasks_edit_permissions;
            return $this->template->view('tasks/kanban/kanban_column_items', $view_data);
        } else {
            //load initial data. full view.
            $task_count_query_options = $options;
            $task_count_query_options["return_task_counts_only"] = true;
            $task_counts = $this->Tasks_model->get_kanban_details($task_count_query_options)->getResult();
            $column_tasks_count = [];
            foreach ($task_counts as $task_count) {
                $column_tasks_count[$task_count->status_id] = $task_count->tasks_count;
            }

            $exclude_status_ids = $this->get_removed_task_status_ids($project_id);
            $statuses = $this->Task_status_model->get_details(array("hide_from_kanban" => 0, "exclude_status_ids" => $exclude_status_ids));

            $view_data["total_columns"] = $statuses->resultID->num_rows;
            $columns = $statuses->getResult();

            $tasks_list = array();
            $tasks_edit_permissions_list = array();

            foreach ($columns as $column) {
                $status_id = $column->id;

                //find the tasks if there is any task
                if (get_array_value($column_tasks_count, $status_id)) {
                    $options["status_id"] = $status_id;
                    $options["limit"] = 15;

                    $tasks = $this->Tasks_model->get_kanban_details($options)->getResult();
                    $tasks_list[$status_id] = $tasks;
                    $tasks_edit_permissions_list[$status_id] = $this->_get_tasks_status_edit_permissions($tasks);
                }
            }

            $view_data["tasks_edit_permissions_list"] = $tasks_edit_permissions_list;
            $view_data["columns"] = $columns;
            $view_data['column_tasks_count'] = $column_tasks_count;
            $view_data['tasks_list'] = $tasks_list;
            return $this->template->view('tasks/kanban/kanban_view', $view_data);
        }
    }

    function set_task_comments_as_read($task_id = 0) {
        if ($task_id) {
            validate_numeric_value($task_id);
            $this->Tasks_model->set_task_comments_as_read($task_id, $this->login_user->id);
        }
    }

    /* get all related data of selected project */

    function get_dropdowns($context = "", $context_id = 0, $return_empty_context = false) {
        $dropdowns = $this->_get_task_related_dropdowns($context, $context_id, $return_empty_context);
        echo json_encode($dropdowns);
    }

    function save_sub_task() {
        $client_id = $this->request->getPost('client_id');
        $lead_id = $this->request->getPost('lead_id');
        $invoice_id = $this->request->getPost('invoice_id');
        $project_id = $this->request->getPost('project_id');
        $estimate_id = $this->request->getPost('estimate_id');
        $order_id = $this->request->getPost('order_id');
        $contract_id = $this->request->getPost('contract_id');
        $proposal_id = $this->request->getPost('proposal_id');
        $subscription_id = $this->request->getPost('subscription_id');
        $expense_id = $this->request->getPost('expense_id');
        $ticket_id = $this->request->getPost('ticket_id');
        $context = $this->request->getPost('context');

        $this->validate_submitted_data(array(
            "parent_task_id" => "required|numeric"
        ));

        if (!$this->can_create_tasks($context)) {
            app_redirect("forbidden");
        }

        $data = array(
            "title" => $this->request->getPost('sub-task-title'),
            "project_id" => $project_id,
            "client_id" => $client_id,
            "lead_id" => $lead_id,
            "invoice_id" => $invoice_id,
            "estimate_id" => $estimate_id,
            "order_id" => $order_id,
            "contract_id" => $contract_id,
            "proposal_id" => $proposal_id,
            "expense_id" => $expense_id,
            "subscription_id" => $subscription_id,
            "ticket_id" => $ticket_id,
            "context" => $context,
            "milestone_id" => $this->request->getPost('milestone_id'),
            "parent_task_id" => $this->request->getPost('parent_task_id'),
            "status_id" => 1,
            "created_date" => get_current_utc_time()
        );

        //don't get assign to id if login user is client
        if ($this->login_user->user_type == "client") {
            $data["assigned_to"] = 0;
        } else {
            $data["assigned_to"] = $this->login_user->id;
        }

        $data = clean_data($data);

        $data["sort"] = $this->Tasks_model->get_next_sort_value($project_id, $data['status_id']);

        $save_id = $this->Tasks_model->ci_save($data);

        if ($save_id) {
            if ($context === "project") {
                log_notification("project_task_created", array("project_id" => $project_id, "task_id" => $save_id));
            } else {
                $context_id_key = $context . "_id";
                $context_id_value = ${$context . "_id"};

                log_notification("general_task_created", array("$context_id_key" => $context_id_value, "task_id" => $save_id));
            }

            $task_info = $this->Tasks_model->get_details(array("id" => $save_id))->getRow();

            echo json_encode(array("success" => true, "task_data" => $this->_make_sub_task_row($task_info), "data" => $this->_row_data($save_id), 'id' => $save_id, 'message' => app_lang('record_saved')));
        } else {
            echo json_encode(array("success" => false, 'message' => app_lang('error_occurred')));
        }
    }

    /* upadate a task status */

    function save_task_status($id = 0) {
        validate_numeric_value($id);
        $status_id = $this->request->getPost('value');
        $data = array(
            "status_id" => $status_id
        );

        $this->check_sub_tasks_statuses($status_id, $id);

        $task_info = $this->Tasks_model->get_details(array("id" => $id))->getRow();

        if (!$this->_can_edit_task_status($task_info)) {
            app_redirect("forbidden");
        }

        if ($task_info->status_id !== $status_id) {
            $data["status_changed_at"] = get_current_utc_time();
        }

        $save_id = $this->Tasks_model->ci_save($data, $id);

        if ($save_id) {
            $task_info = $this->Tasks_model->get_details(array("id" => $id))->getRow();
            echo json_encode(array("success" => true, "data" => (($this->request->getPost("type") == "sub_task") ? $this->_make_sub_task_row($task_info, "data") : $this->_row_data($save_id)), 'id' => $save_id, "message" => app_lang('record_saved')));

            if ($task_info->context === "project") {
                log_notification("project_task_updated", array("project_id" => $task_info->project_id, "task_id" => $save_id, "activity_log_id" => get_array_value($data, "activity_log_id")));
            } else {
                $context_id_key = $task_info->context . "_id";
                $context_id_value = $task_info->{$task_info->context . "_id"};

                log_notification("general_task_updated", array("$context_id_key" => $context_id_value, "task_id" => $save_id, "activity_log_id" => get_array_value($data, "activity_log_id")));
            }
        } else {
            echo json_encode(array("success" => false, app_lang('error_occurred')));
        }
    }

    function update_task_info($id = 0, $data_field = "") {
        if (!$id) {
            return false;
        }

        validate_numeric_value($id);
        $task_info = $this->Tasks_model->get_one($id);

        if (!$this->can_edit_tasks($task_info)) {
            app_redirect("forbidden");
        }

        $value = $this->request->getPost('value');

        $start_date = get_date_from_datetime($task_info->start_date);
        $deadline = get_date_from_datetime($task_info->deadline);
        $start_time = get_time_from_datetime($task_info->start_date);
        $end_time = get_time_from_datetime($task_info->deadline);

        if ($data_field == "start_date") {

            if ($deadline && $deadline < $value) {
                echo json_encode(array("success" => false, 'message' => app_lang('deadline_must_be_equal_or_greater_than_start_date')));
                return false;
            }

            $data = array(
                $data_field => $value . " " . $start_time
            );
        } else if ($data_field == "deadline") {
            //deadline must be greater or equal to start date
            if ($start_date && $value < $start_date) {
                echo json_encode(array("success" => false, 'message' => app_lang('deadline_must_be_equal_or_greater_than_start_date')));
                return false;
            }

            $data = array(
                $data_field => $value . " " . $end_time
            );
        } else if ($data_field == "start_time" || $data_field == "end_time") {
            if (get_setting("time_format") != "24_hours") {
                $value = convert_time_to_24hours_format($value);
            }

            if ($data_field == "start_time") {

                if ($end_time && $end_time!="00:00:00" && ($start_date . " " . $value) > $task_info->deadline) {
                    echo json_encode(array("success" => false, 'message' => app_lang('deadline_must_be_equal_or_greater_than_start_date')));
                    return false;
                }

                $data["start_date"] = $start_date . " " . $value;
            } else if ($data_field == "end_time") {
                
                 if ($task_info->start_date > ($deadline . " " . $value) ) {
                    echo json_encode(array("success" => false, 'message' => app_lang('deadline_must_be_equal_or_greater_than_start_date')));
                    return false;
                }
                
                $data["deadline"] = $deadline . " " . $value;
            }
        } else {
            $data = array(
                $data_field => $value
            );
        }

        if ($data_field === "status_id" && $task_info->status_id !== $value) {
            $data["status_changed_at"] = get_current_utc_time();
        }

        if ($data_field == "status_id") {
            $this->check_sub_tasks_statuses($value, $id);
        }

        $save_id = $this->Tasks_model->ci_save($data, $id);
        if (!$save_id) {
            echo json_encode(array("success" => false, app_lang('error_occurred')));
            return false;
        }

        $task_info = $this->Tasks_model->get_details(array("id" => $save_id))->getRow(); //get data after save

        $success_array = array("success" => true, "data" => $this->_row_data($save_id), 'id' => $save_id, "message" => app_lang('record_saved'));

        if ($data_field == "assigned_to") {
            $success_array["assigned_to_avatar"] = get_avatar($task_info->assigned_to_avatar);
            $success_array["assigned_to_id"] = $task_info->assigned_to;
        }

        if ($data_field == "labels") {
            $success_array["labels"] = $task_info->labels_list ? make_labels_view_data($task_info->labels_list) : "<span class='text-off'>" . app_lang("add") . " " . app_lang("label") . "<span>";
        }

        if ($data_field == "milestone_id") {
            $success_array["milestone_id"] = $task_info->milestone_id;
        }

        if ($data_field == "points") {
            $success_array["points"] = $task_info->points;
        }

        if ($data_field == "status_id") {
            $success_array["status_color"] = $task_info->status_color;
        }

        if ($data_field == "priority_id") {
            $success_array["priority_pill"] = "<span class='sub-task-icon priority-badge' style='background: $task_info->priority_color'><i data-feather='$task_info->priority_icon' class='icon-14'></i></span> ";
        }

        if ($data_field == "collaborators") {
            $success_array["collaborators"] = $task_info->collaborator_list ? $this->_get_collaborators($task_info->collaborator_list, false) : "<span class='text-off'>" . app_lang("add") . " " . app_lang("collaborators") . "<span>";
        }

        if ($data_field == "start_date" || $data_field == "deadline") {
            $date = "-";
            if (is_date_exists($task_info->$data_field)) {
                $date = format_to_date($task_info->$data_field, false);
            }
            $success_array["date"] = $date;

            if (get_setting("show_time_with_task_start_date_and_deadline")) {
                if ($data_field == "start_date" && !$start_date) {
                    $success_array["time"] = " " . js_anchor("<span class='text-off'>" . app_lang("add") . " " . app_lang("start_time") . "<span>", array("data-id" => $save_id, "data-value" => "", "data-act" => "update-task-info", "data-act-type" => "start_time"));
                } else if ($data_field == "deadline" && !$deadline) {
                    $success_array["time"] = " " . js_anchor("<span class='text-off'>" . app_lang("add") . " " . app_lang("end_time") . "<span>", array("data-id" => $save_id, "data-value" => "", "data-act" => "update-task-info", "data-act-type" => "end_time"));
                }
            }
        }

        if ($data_field == "start_time" || $data_field == "end_time") {
            $time = "-";
            if ($data_field == "start_time") {
                if (is_date_exists($task_info->start_date)) {
                    $time = format_to_time($task_info->start_date, false, true);
                }
            } else if ($data_field == "end_time") {
                if (is_date_exists($task_info->deadline)) {
                    $time = format_to_time($task_info->deadline, false, true);
                }
            }

            $success_array["time"] = $time;
        }

        echo json_encode($success_array);

        if ($task_info->context === "project") {
            log_notification("project_task_updated", array("project_id" => $task_info->project_id, "task_id" => $save_id, "activity_log_id" => get_array_value($data, "activity_log_id")));
        } else {
            $context_id_key = $task_info->context . "_id";
            $context_id_value = $task_info->{$task_info->context . "_id"};

            log_notification("general_task_updated", array("$context_id_key" => $context_id_value, "task_id" => $save_id, "activity_log_id" => get_array_value($data, "activity_log_id")));
        }
    }

    /* upadate a task status */

    function save_task_sort_and_status() {

        $this->validate_submitted_data(array(
            "id" => "required|numeric"
        ));

        $id = $this->request->getPost('id');
        $task_info = $this->Tasks_model->get_one($id);

        if (!$this->_can_edit_task_status($task_info)) {
            app_redirect("forbidden");
        }

        $status_id = $this->request->getPost('status_id');
        $this->check_sub_tasks_statuses($status_id, $id);
        $data = array(
            "sort" => $this->request->getPost('sort')
        );

        if ($status_id) {
            $data["status_id"] = $status_id;

            if ($task_info->status_id !== $status_id) {
                $data["status_changed_at"] = get_current_utc_time();
            }
        }

        $save_id = $this->Tasks_model->ci_save($data, $id);

        if ($save_id) {
            if ($status_id) {
                if ($task_info->context === "project") {
                    log_notification("project_task_updated", array("project_id" => $task_info->project_id, "task_id" => $save_id, "activity_log_id" => get_array_value($data, "activity_log_id")));
                } else {
                    $context_id_key = $task_info->context . "_id";
                    $context_id_value = $task_info->{$task_info->context . "_id"};

                    log_notification("general_task_updated", array("$context_id_key" => $context_id_value, "task_id" => $save_id, "activity_log_id" => get_array_value($data, "activity_log_id")));
                }
            }
        } else {
            echo json_encode(array("success" => false, app_lang('error_occurred')));
        }
    }

    /* list of tasks, prepared for datatable  */

    function all_tasks_list_data($is_widget = 0) {
        $this->access_only_team_members();

        $project_id = $this->request->getPost('project_id');

        $specific_user_id = $this->request->getPost('specific_user_id');

        $custom_fields = $this->Custom_fields_model->get_available_fields_for_table("tasks", $this->login_user->is_admin, $this->login_user->user_type);

        $quick_filter = $this->request->getPost('quick_filter');
        if ($quick_filter) {
            $status = "";
        } else {
            $status = $this->request->getPost('status_id') ? implode(",", $this->request->getPost('status_id')) : "";
        }

        $context = $this->request->getPost('context');

        $options = array(
            "specific_user_id" => $specific_user_id,
            "project_id" => $project_id,
            "context" => $context,
            "milestone_id" => $this->request->getPost('milestone_id'),
            "priority_id" => $this->request->getPost('priority_id'),
            "deadline" => $this->request->getPost('deadline'),
            "custom_fields" => $custom_fields,
            "status_ids" => $status,
            "unread_status_user_id" => $this->login_user->id,
            "quick_filter" => $quick_filter,
            "label_id" => $this->request->getPost('label_id'),
            "custom_field_filter" => $this->prepare_custom_field_filter_values("tasks", $this->login_user->is_admin, $this->login_user->user_type)
        );

        //prepare accessible query parameters
        $contexts = $this->_get_accessible_contexts("view");
        $options = array_merge($options, $this->_prepare_query_parameters_for_accessible_contexts($contexts));

        if (count($contexts) == 0) {
            //don't show anything 
            $options["context"] = "noting";
        }

        if ($is_widget) {
            $todo_status_id = $this->Task_status_model->get_one_where(array("key_name" => "done", "deleted" => 0));
            if ($todo_status_id) {
                $options["exclude_status_id"] = $todo_status_id->id;
                $options["specific_user_id"] = $this->login_user->id;
            }
        }

        $all_options = append_server_side_filtering_commmon_params($options);

        $result = $this->Tasks_model->get_details($all_options);

        $show_time_with_task = (get_setting("show_time_with_task_start_date_and_deadline")) ? true : false;

        //by this, we can handel the server side or client side from the app table prams.
        if (get_array_value($all_options, "server_side")) {
            $list_data = get_array_value($result, "data");
        } else {
            $list_data = $result->getResult();
            $result = array();
        }


        $tasks_edit_permissions = $this->_get_tasks_edit_permissions($list_data);
        $tasks_status_edit_permissions = $this->_get_tasks_status_edit_permissions($list_data, $tasks_edit_permissions);

        $result_data = array();
        foreach ($list_data as $data) {
            $result_data[] = $this->_make_row($data, $custom_fields, $show_time_with_task, $tasks_edit_permissions, $tasks_status_edit_permissions);
        }

        $result["data"] = $result_data;

        echo json_encode($result);
    }

    //load gantt tab
    function gantt($project_id = 0) {

        if ($project_id) {
            validate_numeric_value($project_id);

            $this->init_project_permission_checker($project_id);

            $view_data['project_id'] = $project_id;

            //prepare members list
            $view_data['milestone_dropdown'] = $this->_get_milestones_dropdown_list($project_id);
            $view_data['project_members_dropdown'] = $this->_get_project_members_dropdown_list($project_id);
            $view_data["show_milestone_info"] = $this->can_view_milestones();

            $view_data['show_project_members_dropdown'] = true;
            if ($this->login_user->user_type == "client") {
                $view_data['show_project_members_dropdown'] = false;
            }

            $exclude_status_ids = $this->get_removed_task_status_ids($project_id);
            $task_status_options = array("exclude_status_ids" => $exclude_status_ids);
            if (!$project_id) {
                $task_status_options["hide_from_non_project_related_tasks"] = 0;
            }
            $statuses = $this->Task_status_model->get_details($task_status_options)->getResult();

            $status_dropdown = array();

            foreach ($statuses as $status) {
                $status_dropdown[] = array("id" => $status->id, "text" => ( $status->key_name ? app_lang($status->key_name) : $status->title));
            }

            $view_data['status_dropdown'] = $this->_get_task_statuses_dropdown($project_id);

            return $this->template->view("projects/gantt/index", $view_data);
        }
    }

    //prepare gantt data for gantt chart
    function gantt_data($project_id = 0, $group_by = "milestones", $milestone_id = 0, $user_id = 0, $status = "") {
        validate_numeric_value($project_id);
        validate_numeric_value($milestone_id);
        validate_numeric_value($user_id);
        $can_edit_tasks = true;
        if ($project_id) {
            if (!$this->_can_edit_project_tasks($project_id)) {
                $can_edit_tasks = false;
            }
        }

        $options = array(
            "status_ids" => str_replace('-', ',', $status),
            "show_assigned_tasks_only_user_id" => $this->show_assigned_tasks_only_user_id(),
            "milestone_id" => $milestone_id,
            "assigned_to" => $user_id
        );

        if (!$status) {
            $options["exclude_status"] = 3; //don't show completed tasks by default
        }

        $options["project_id"] = $project_id;

        if ($this->login_user->user_type == "staff" && !$this->can_manage_all_projects()) {
            $options["user_id"] = $this->login_user->id;
        }

        if ($this->login_user->user_type == "client") {
            if (!$project_id) {
                app_redirect("forbidden");
            }
            if (!$this->can_view_tasks("project", $project_id)) {
                app_redirect("forbidden");
            }
        }


        $gantt_data = $this->Projects_model->get_gantt_data($options);
        $now = get_current_utc_time("Y-m-d");

        $tasks_array = array();
        $group_array = array();

        foreach ($gantt_data as $data) {

            $start_date = is_date_exists($data->start_date) ? $data->start_date : $now;
            $end_date = is_date_exists($data->end_date) ? $data->end_date : $data->milestone_due_date;

            if (!is_date_exists($end_date)) {
                $end_date = $start_date;
            }

            $group_id = 0;
            $group_name = "";

            if ($group_by === "milestones") {
                $group_id = $data->milestone_id;
                $group_name = $data->milestone_title;
            } else if ($group_by === "members") {
                $group_id = $data->assigned_to;
                $group_name = $data->assigned_to_name;
            } else if ($group_by === "projects") {
                $group_id = $data->project_id;
                $group_name = $data->project_name;
            }

            //prepare final group credentials
            $group_id = $group_by . "-" . $group_id;
            if (!$group_name) {
                $group_name = app_lang("not_specified");
            }

            $color = $data->status_color;

            //has deadline? change the color of date based on status
            if ($data->status_id == "1" && is_date_exists($data->end_date) && get_my_local_time("Y-m-d") > $data->end_date) {
                $color = "#d9534f";
            }

            if ($end_date < $start_date) {
                $end_date = $start_date;
            }

            //don't add any tasks if more than 5 years before of after
            if ($this->invalid_date_of_gantt($start_date, $end_date)) {
                continue;
            }

            if (!in_array($group_id, array_column($group_array, "id"))) {
                //it's a group and not added, add it first
                $gantt_array_data = array(
                    "id" => $group_id,
                    "name" => $group_name,
                    "start" => $start_date,
                    "end" => add_period_to_date($start_date, 3, "days"),
                    "draggable" => false, //disable group dragging
                    "custom_class" => "no-drag",
                    "progress" => 0 //we've to add this to prevent error
                );

                //add group seperately 
                $group_array[] = $gantt_array_data;
            }

            //so, the group is already added
            //prepare group start date
            //get the first start date from tasks
            $group_key = array_search($group_id, array_column($group_array, "id"));
            if (get_array_value($group_array[$group_key], "start") > $start_date) {
                $group_array[$group_key]["start"] = $start_date;
                $group_array[$group_key]["end"] = add_period_to_date($start_date, 3, "days");
            }

            $dependencies = $group_id;

            //link parent task
            if ($data->parent_task_id) {
                $dependencies .= ", " . $data->parent_task_id;
            }

            //add task data under a group
            $gantt_array_data = array(
                "id" => $data->task_id,
                "name" => $data->task_title,
                "start" => $start_date,
                "end" => $end_date,
                "bg_color" => $color,
                "progress" => 0, //we've to add this to prevent error
                "dependencies" => $dependencies,
                "draggable" => $can_edit_tasks ? true : false, //disable dragging for non-permitted users
            );

            $tasks_array[$group_id][] = $gantt_array_data;
        }

        $gantt = array();

        //prepare final gantt data
        foreach ($tasks_array as $key => $tasks) {
            //add group first
            $gantt[] = get_array_value($group_array, array_search($key, array_column($group_array, "id")));

            //add tasks
            foreach ($tasks as $task) {
                $gantt[] = $task;
            }
        }

        echo json_encode($gantt);
    }

    private function invalid_date_of_gantt($start_date, $end_date) {
        $start_year = explode('-', $start_date);
        $start_year = get_array_value($start_year, 0);

        $end_year = explode('-', $end_date);
        $end_year = get_array_value($end_year, 0);

        $current_year = get_today_date();
        $current_year = explode('-', $current_year);
        $current_year = get_array_value($current_year, 0);

        if (($current_year - $start_year) > 5 || ($start_year - $current_year) > 5 || ($current_year - $end_year) > 5 || ($end_year - $current_year) > 5) {
            return true;
        }
    }

    /* get list of milestones for filter */

    function get_milestones_for_filter() {

        $this->access_only_team_members();
        $project_id = $this->request->getPost("project_id");
        if ($project_id) {
            echo $this->_get_milestones_dropdown_list($project_id);
        }
    }

    /* batch update modal form */

    function batch_update_modal_form($task_ids = "") {
        $this->access_only_team_members();
        $project_id = $this->request->getPost("project_id");

        if ($task_ids && $project_id) {
            $view_data = $this->_get_task_related_dropdowns("project", $project_id, true);
            $view_data["task_ids"] = clean_data($task_ids);
            $view_data["project_id"] = $project_id;

            return $this->template->view("tasks/batch_update/modal_form", $view_data);
        } else {
            show_404();
        }
    }

    /* save batch tasks */

    function save_batch_update() {
        $this->access_only_team_members();

        $this->validate_submitted_data(array(
            "project_id" => "required|numeric"
        ));

        $project_id = $this->request->getPost('project_id');

        $batch_fields = $this->request->getPost("batch_fields");
        if (!$batch_fields) {
            echo json_encode(array('success' => false, 'message' => app_lang('no_field_has_selected')));
            exit();
        }

        $fields_array = explode('-', $batch_fields);

        $data = array();
        foreach ($fields_array as $field) {
            if ($field != "project_id") {
                $data[$field] = $this->request->getPost($field);
            }
        }

        $data = clean_data($data);

        $task_ids = $this->request->getPost("task_ids");
        if (!$task_ids) {
            echo json_encode(array('success' => false, 'message' => app_lang('error_occurred')));
            exit();
        }

        $tasks_ids_array = explode('-', $task_ids);
        $now = get_current_utc_time();

        foreach ($tasks_ids_array as $id) {
            unset($data["activity_log_id"]);
            unset($data["status_changed_at"]);

            //check user's permission on this task's project
            $task_info = $this->Tasks_model->get_one($id);
            if (!$this->can_edit_tasks($task_info)) {
                app_redirect("forbidden");
            }

            if (array_key_exists("status_id", $data) && $task_info->status_id !== get_array_value($data, "status_id")) {
                $data["status_changed_at"] = $now;
            }

            $save_id = $this->Tasks_model->ci_save($data, $id);

            if ($save_id) {
                //we don't send notification if the task is changing on the same position
                $activity_log_id = get_array_value($data, "activity_log_id");
                if ($activity_log_id) {
                    if ($task_info->context === "project") {
                        log_notification("project_task_updated", array("project_id" => $project_id, "task_id" => $save_id, "activity_log_id" => $activity_log_id));
                    } else {
                        $context_id_key = $task_info->context . "_id";
                        $context_id_value = $task_info->{$task_info->context . "_id"};

                        log_notification("general_task_updated", array("$context_id_key" => $context_id_value, "task_id" => $save_id, "activity_log_id" => $activity_log_id));
                    }
                }
            }
        }

        echo json_encode(array("success" => true, 'message' => app_lang('record_saved')));
    }

    function get_checklist_group_suggestion() {
        $task_id = $this->request->getPost("task_id");
        $task_info = $this->Tasks_model->get_one($task_id);
        if (!$this->can_edit_tasks($task_info)) {
            app_redirect("forbidden");
        }


        $key = $this->request->getPost("q");
        $suggestion = array();

        $items = $this->Checklist_groups_model->get_group_suggestion($key);

        foreach ($items as $item) {
            $suggestion[] = array("id" => $item->id, "text" => $item->title);
        }

        echo json_encode($suggestion);
    }

    //prepare suggestion of checklist template
    function get_checklist_template_suggestion() {
        $task_id = $this->request->getPost("task_id");
        $task_info = $this->Tasks_model->get_one($task_id);
        if (!$this->can_edit_tasks($task_info)) {
            app_redirect("forbidden");
        }

        $key = $this->request->getPost("q");
        $suggestion = array();

        $items = $this->Checklist_template_model->get_template_suggestion($key);

        foreach ($items as $item) {
            $suggestion[] = array("id" => $item->title, "text" => $item->title);
        }

        echo json_encode($suggestion);
    }

    /* save task comments */

    function save_comment() {
        $id = $this->request->getPost('id');

        $target_path = get_setting("timeline_file_path");
        $files_data = move_files_from_temp_dir_to_permanent_dir($target_path, "project_comment");

        $project_id = $this->request->getPost('project_id');
        $task_id = $this->request->getPost('task_id');
        $description = $this->request->getPost('description');

        $data = array(
            "created_by" => $this->login_user->id,
            "created_at" => get_current_utc_time(),
            "project_id" => $project_id ? $project_id : 0,
            "file_id" => 0,
            "task_id" => $task_id,
            "customer_feedback_id" => 0,
            "comment_id" => 0,
            "description" => $description
        );

        $data = clean_data($data);

        $data["files"] = $files_data; //don't clean serilized data

        $save_id = $this->Project_comments_model->save_comment($data, $id);
        if ($save_id) {
            $response_data = "";
            $options = array("id" => $save_id, "login_user_id" => $this->login_user->id);

            if ($this->request->getPost("reload_list")) {
                $view_data['comments'] = $this->Project_comments_model->get_details($options)->getResult();
                $response_data = $this->template->view("projects/comments/comment_list", $view_data);
            }
            echo json_encode(array("success" => true, "data" => $response_data, 'message' => app_lang('comment_submited')));

            $comment_info = $this->Project_comments_model->get_one($save_id);
            $task_info = $this->Tasks_model->get_one($comment_info->task_id);

            $notification_options = array("task_id" => $comment_info->task_id, "project_comment_id" => $save_id);

            if ($comment_info->project_id) {
                $notification_options["project_id"] = $comment_info->project_id;
                log_notification("project_task_commented", $notification_options);
            } else {
                $context_id_key = $task_info->context . "_id";
                $context_id_value = $task_info->{$task_info->context . "_id"};

                $notification_options["$context_id_key"] = $context_id_value;

                log_notification("general_task_commented", $notification_options);
            }
        } else {
            echo json_encode(array("success" => false, 'message' => app_lang('error_occurred')));
        }
    }

    /* download task files by zip */

    function download_comment_files($id) {

        $info = $this->Project_comments_model->get_one($id);
        $task_info = $this->Tasks_model->get_one($info->task_id);

        if (!$this->can_view_tasks("", 0, $task_info)) {
            app_redirect("forbidden");
        }

        return $this->download_app_files(get_setting("timeline_file_path"), $info->files);
    }

    function get_task_labels_dropdown_for_filter() {
        $labels_dropdown = array(array("id" => "", "text" => "- " . app_lang("label") . " -"));

        $options = array(
            "context" => "task"
        );

        $labels = $this->Labels_model->get_details($options)->getResult();
        foreach ($labels as $label) {
            $labels_dropdown[] = array("id" => $label->id, "text" => $label->title);
        }

        return $labels_dropdown;
    }

    /* get member suggestion with start typing '@' */

    function get_member_suggestion_to_mention() {
        $options = array("status" => "active", "user_type" => "staff");
        $members = $this->Users_model->get_details($options)->getResult();
        $members_dropdown = array();
        foreach ($members as $member) {
            $members_dropdown[] = array("name" => $member->first_name . " " . $member->last_name, "content" => "@[" . $member->first_name . " " . $member->last_name . " :" . $member->id . "]");
        }

        if ($members_dropdown) {
            echo json_encode(array("success" => TRUE, "data" => $members_dropdown));
        } else {
            echo json_encode(array("success" => FALSE));
        }
    }

    private function _get_task_statuses_dropdown($project_id = 0) {
        $exclude_status_ids = $this->get_removed_task_status_ids($project_id);
        $task_status_options = array("exclude_status_ids" => $exclude_status_ids);
        if (!$project_id) {
            $task_status_options["hide_from_non_project_related_tasks"] = 0;
        }
        $statuses = $this->Task_status_model->get_details($task_status_options)->getResult();

        $status_dropdown = array();

        foreach ($statuses as $status) {
            $status_dropdown[] = array("id" => $status->id, "text" => ( $status->key_name ? app_lang($status->key_name) : $status->title));
        }

        return json_encode($status_dropdown);
    }

    function get_task_statuses_dropdown($project_id = 0) {
        echo $this->_get_task_statuses_dropdown($project_id);
    }

}
