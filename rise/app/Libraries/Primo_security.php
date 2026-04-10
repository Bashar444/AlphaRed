<?php

namespace App\Libraries;

/**
 * PrimoData security audit helper.
 * Utility methods used across controllers for input sanitization.
 */
class Primo_security {

    /**
     * Sanitize survey input data.
     */
    static function sanitize_survey_input($data) {
        $clean = array();
        $clean['title'] = isset($data['title']) ? strip_tags(trim($data['title'])) : '';
        $clean['description'] = isset($data['description']) ? strip_tags(trim($data['description'])) : '';
        $clean['language'] = isset($data['language']) && in_array($data['language'], array('en', 'ta')) ? $data['language'] : 'en';
        $clean['target_responses'] = isset($data['target_responses']) ? abs(intval($data['target_responses'])) : 100;
        $clean['status'] = isset($data['status']) && in_array($data['status'], array('draft', 'active', 'paused', 'closed', 'archived')) ? $data['status'] : 'draft';
        return $clean;
    }

    /**
     * Sanitize question input data.
     */
    static function sanitize_question_input($data) {
        $clean = array();
        $clean['text'] = isset($data['text']) ? strip_tags(trim($data['text'])) : '';
        $clean['type'] = isset($data['type']) && in_array($data['type'], array(
            'single_choice', 'multiple_choice', 'text', 'number', 'rating', 'scale', 'dropdown'
        )) ? $data['type'] : 'text';
        $clean['required'] = isset($data['required']) ? intval($data['required']) : 0;

        // Options must be a valid JSON array
        if (isset($data['options'])) {
            $options = is_string($data['options']) ? json_decode($data['options'], true) : $data['options'];
            if (is_array($options)) {
                $clean['options'] = json_encode(array_map(function ($o) {
                    return strip_tags(trim(strval($o)));
                }, $options));
            } else {
                $clean['options'] = '[]';
            }
        }

        return $clean;
    }

    /**
     * Sanitize respondent registration data.
     */
    static function sanitize_respondent_input($data) {
        $clean = array();
        $clean['first_name'] = isset($data['first_name']) ? strip_tags(trim($data['first_name'])) : '';
        $clean['last_name'] = isset($data['last_name']) ? strip_tags(trim($data['last_name'])) : '';
        $clean['phone'] = isset($data['phone']) ? preg_replace('/[^0-9+]/', '', $data['phone']) : '';
        $clean['email'] = isset($data['email']) ? filter_var(trim($data['email']), FILTER_SANITIZE_EMAIL) : '';

        // Demographics
        $demographics = array();
        $allowed_age = array('18-24', '25-34', '35-44', '45-54', '55-64', '65+');
        $allowed_gender = array('male', 'female', 'other', 'prefer_not_to_say');

        if (isset($data['age_group']) && in_array($data['age_group'], $allowed_age)) {
            $demographics['age_group'] = $data['age_group'];
        }
        if (isset($data['gender']) && in_array($data['gender'], $allowed_gender)) {
            $demographics['gender'] = $data['gender'];
        }
        if (isset($data['region'])) {
            $demographics['region'] = strip_tags(trim($data['region']));
        }
        if (isset($data['education'])) {
            $demographics['education'] = strip_tags(trim($data['education']));
        }
        if (isset($data['income'])) {
            $demographics['income'] = strip_tags(trim($data['income']));
        }

        $clean['demographics'] = json_encode($demographics);
        return $clean;
    }

    /**
     * Validate that a file upload is safe.
     */
    static function validate_upload($file, $allowed_types = array('csv', 'xlsx', 'pdf')) {
        if (!$file || !$file->isValid()) {
            return array('valid' => false, 'error' => 'Invalid file.');
        }

        $ext = strtolower($file->getExtension());
        if (!in_array($ext, $allowed_types)) {
            return array('valid' => false, 'error' => 'File type not allowed.');
        }

        // Max 10MB
        if ($file->getSize() > 10 * 1024 * 1024) {
            return array('valid' => false, 'error' => 'File too large (max 10MB).');
        }

        return array('valid' => true, 'error' => '');
    }
}
