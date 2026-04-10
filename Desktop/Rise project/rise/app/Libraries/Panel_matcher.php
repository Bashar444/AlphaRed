<?php

namespace App\Libraries;

class Panel_matcher {

    private $ci;

    function __construct() {
        $this->ci = &get_instance();
    }

    /**
     * Match respondents to a survey's targeting criteria.
     *
     * @param object $survey Survey object with targeting JSON field
     * @return array Array of matching respondent IDs
     */
    function match($survey) {
        $targeting = $survey->targeting ? json_decode($survey->targeting, true) : array();

        if (empty($targeting)) {
            // No targeting = match all verified respondents
            $results = $this->ci->Primo_respondents_model->get_matching_respondents(array());
            return $this->_extract_ids($results);
        }

        $filters = array();

        // Age range
        if (isset($targeting['age_min'])) {
            $filters['age_min'] = intval($targeting['age_min']);
        }
        if (isset($targeting['age_max'])) {
            $filters['age_max'] = intval($targeting['age_max']);
        }

        // Gender
        if (!empty($targeting['gender']) && $targeting['gender'] !== 'any') {
            $filters['gender'] = $targeting['gender'];
        }

        // Region
        if (!empty($targeting['region'])) {
            $filters['region'] = $targeting['region'];
        }

        $results = $this->ci->Primo_respondents_model->get_matching_respondents($filters);
        return $this->_extract_ids($results);
    }

    /**
     * Calculate estimated reach for given targeting filters.
     *
     * @param array $filters Targeting filter array
     * @return int Estimated number of matching respondents
     */
    function estimate_reach($filters = array()) {
        $results = $this->ci->Primo_respondents_model->get_matching_respondents($filters);
        return $results->getNumRows();
    }

    /**
     * Score a respondent's fit for a survey based on targeting criteria.
     *
     * @param object $respondent Respondent object with demographics JSON
     * @param array $targeting Targeting criteria array
     * @return float Score 0-100
     */
    function score_fit($respondent, $targeting) {
        if (empty($targeting)) {
            return 100.0;
        }

        $score = 0;
        $criteria_count = 0;
        $demographics = $respondent->demographics ? json_decode($respondent->demographics, true) : array();

        // Age match
        if (isset($targeting['age_min']) || isset($targeting['age_max'])) {
            $criteria_count++;
            $age = isset($demographics['age']) ? intval($demographics['age']) : 0;
            $min = isset($targeting['age_min']) ? intval($targeting['age_min']) : 0;
            $max = isset($targeting['age_max']) ? intval($targeting['age_max']) : 120;
            if ($age >= $min && $age <= $max) {
                $score += 100;
            }
        }

        // Gender match
        if (!empty($targeting['gender']) && $targeting['gender'] !== 'any') {
            $criteria_count++;
            $gender = isset($demographics['gender']) ? $demographics['gender'] : '';
            if (strtolower($gender) === strtolower($targeting['gender'])) {
                $score += 100;
            }
        }

        // Region match
        if (!empty($targeting['region'])) {
            $criteria_count++;
            $region = isset($demographics['region']) ? $demographics['region'] : '';
            if (stripos($region, $targeting['region']) !== false) {
                $score += 100;
            }
        }

        return $criteria_count > 0 ? round($score / $criteria_count, 2) : 100.0;
    }

    private function _extract_ids($result) {
        $ids = array();
        foreach ($result->getResult() as $row) {
            $ids[] = $row->id;
        }
        return $ids;
    }
}
