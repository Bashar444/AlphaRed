<?php

namespace App\Controllers;

class Respondents extends App_Controller {

    function __construct() {
        parent::__construct();
    }

    /**
     * Public registration page for survey respondents.
     */
    function register() {
        $view_data["page_title"] = "Join as Respondent";
        return view("respondents/register", $view_data);
    }

    /**
     * Handle registration form submission.
     */
    function do_register() {
        $this->validate_submitted_data(array(
            "first_name" => "required",
            "last_name" => "required",
            "email" => "required|valid_email",
            "phone" => "required",
            "password" => "required|min_length[8]",
        ));

        // Check if email already exists
        $existing = $this->Users_model->get_details(array(
            "email" => $this->request->getPost("email"),
        ))->getRow();
        if ($existing) {
            echo json_encode(array("success" => false, "message" => "Email already registered."));
            return;
        }

        // Create user account with respondent type
        $user_data = array(
            "first_name" => $this->request->getPost("first_name"),
            "last_name" => $this->request->getPost("last_name"),
            "email" => $this->request->getPost("email"),
            "phone" => $this->request->getPost("phone"),
            "password" => password_hash($this->request->getPost("password"), PASSWORD_DEFAULT),
            "user_type" => "respondent",
            "status" => "active",
        );
        $user_id = $this->Users_model->ci_save($user_data);

        if ($user_id) {
            // Create respondent profile
            $demographics = array(
                "age" => $this->request->getPost("age") ? intval($this->request->getPost("age")) : null,
                "gender" => $this->request->getPost("gender") ?: null,
                "region" => $this->request->getPost("region") ?: null,
                "education" => $this->request->getPost("education") ?: null,
                "occupation" => $this->request->getPost("occupation") ?: null,
            );

            $respondent_data = array(
                "user_id" => $user_id,
                "kyc_status" => "pending",
                "quality_score" => 100,
                "total_surveys" => 0,
                "rejected_count" => 0,
                "demographics" => json_encode($demographics),
            );
            $this->Primo_respondents_model->ci_save($respondent_data);

            // Generate OTP for phone verification
            $this->_send_otp($user_id);

            echo json_encode(array("success" => true, "message" => "Registration successful. Please verify your phone."));
        } else {
            echo json_encode(array("success" => false, "message" => "Registration failed. Please try again."));
        }
    }

    /**
     * Show OTP verification page.
     */
    function verify() {
        $view_data["page_title"] = "Verify Phone";
        return view("respondents/verify", $view_data);
    }

    /**
     * Verify OTP submitted by respondent.
     */
    function verify_otp() {
        $this->validate_submitted_data(array(
            "user_id" => "required|numeric",
            "otp" => "required|exact_length[6]",
        ));

        $user_id = $this->request->getPost("user_id");
        $otp = $this->request->getPost("otp");

        $otp_table = $this->db->prefixTable('primo_respondent_otp');
        $sql = "SELECT * FROM $otp_table WHERE respondent_id=? AND expires_at > NOW() ORDER BY id DESC LIMIT 1";
        $otp_record = $this->db->query($sql, array($user_id))->getRow();

        if ($otp_record && password_verify($otp, $otp_record->otp_hash)) {
            // Mark respondent as verified
            $respondent = $this->Primo_respondents_model->get_by_user_id($user_id);
            if ($respondent) {
                $this->Primo_respondents_model->ci_save(array(
                    "kyc_status" => "verified",
                    "verified_at" => date("Y-m-d H:i:s"),
                ), $respondent->id);
            }

            // Delete used OTPs
            $this->db->query("DELETE FROM $otp_table WHERE respondent_id=?", array($user_id));

            echo json_encode(array("success" => true, "message" => "Phone verified successfully."));
        } else {
            echo json_encode(array("success" => false, "message" => "Invalid or expired OTP."));
        }
    }

    /**
     * Resend OTP.
     */
    function resend_otp() {
        $user_id = $this->request->getPost("user_id");
        if ($user_id) {
            $this->_send_otp($user_id);
            echo json_encode(array("success" => true, "message" => "OTP sent."));
        } else {
            echo json_encode(array("success" => false, "message" => "Invalid request."));
        }
    }

    /**
     * Generate and send OTP for a user.
     */
    private function _send_otp($user_id) {
        $otp_table = $this->db->prefixTable('primo_respondent_otp');

        // Generate 6-digit OTP
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $otp_hash = password_hash($otp, PASSWORD_DEFAULT);
        $expires_at = date("Y-m-d H:i:s", strtotime("+10 minutes"));

        // Store OTP
        $this->db->query(
            "INSERT INTO $otp_table (respondent_id, otp_hash, expires_at) VALUES (?, ?, ?)",
            array($user_id, $otp_hash, $expires_at)
        );

        // In production, send via SMS gateway (MSG91 / Twilio)
        // For now, log it for testing
        log_message('info', "OTP for user $user_id: $otp");

        return $otp;
    }
}
