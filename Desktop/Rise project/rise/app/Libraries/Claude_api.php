<?php

namespace App\Libraries;

/**
 * Claude API wrapper for AI narrative generation.
 * Uses Anthropic's Messages API via cURL.
 */
class Claude_api {

    private $api_key;
    private $model;
    private $base_url = 'https://api.anthropic.com/v1/messages';

    function __construct() {
        $config = config('PrimoData');
        $this->api_key = $config->claude_api_key ?? '';
        $this->model = $config->claude_model ?? 'claude-sonnet-4-20250514';
    }

    /**
     * Generate a narrative summary of survey analysis results.
     *
     * @param array $analysis_data Array with descriptive stats, frequency data, etc.
     * @param string $survey_title The survey title for context
     * @param string $language Output language (en/ta)
     * @return array ['success' => bool, 'narrative' => string, 'error' => string]
     */
    function generate_narrative($analysis_data, $survey_title = '', $language = 'en') {
        if (empty($this->api_key)) {
            return array('success' => false, 'narrative' => '', 'error' => 'Claude API key not configured.');
        }

        $prompt = $this->_build_prompt($analysis_data, $survey_title, $language);

        $response = $this->_call_api($prompt);
        if ($response['success']) {
            return array(
                'success' => true,
                'narrative' => $response['content'],
                'error' => '',
            );
        }

        return array('success' => false, 'narrative' => '', 'error' => $response['error']);
    }

    /**
     * Build the prompt for narrative generation.
     */
    private function _build_prompt($analysis_data, $survey_title, $language) {
        $lang_instruction = $language === 'ta'
            ? "Write the narrative in Tamil (தமிழ்)."
            : "Write the narrative in English.";

        $data_json = json_encode($analysis_data, JSON_PRETTY_PRINT);

        return "You are an expert research analyst. Generate a clear, professional narrative summary of the following survey analysis results.

Survey: $survey_title

$lang_instruction

Include:
1. Executive Summary (2-3 sentences)
2. Key Findings (bullet points for each question/variable)
3. Notable Patterns or Trends
4. Recommendations (if applicable)

Analysis Data:
```json
$data_json
```

Write in a formal academic tone suitable for a research report. Be specific with numbers and percentages.";
    }

    /**
     * Call the Anthropic Messages API.
     */
    private function _call_api($prompt, $max_tokens = 2048) {
        $headers = array(
            'Content-Type: application/json',
            'x-api-key: ' . $this->api_key,
            'anthropic-version: 2023-06-01',
        );

        $body = json_encode(array(
            'model' => $this->model,
            'max_tokens' => $max_tokens,
            'messages' => array(
                array('role' => 'user', 'content' => $prompt),
            ),
        ));

        $ch = curl_init($this->base_url);
        curl_setopt_array($ch, array(
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $body,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_TIMEOUT => 120,
            CURLOPT_SSL_VERIFYPEER => true,
        ));

        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            return array('success' => false, 'content' => '', 'error' => "cURL error: $error");
        }

        if ($http_code !== 200) {
            $decoded = json_decode($response, true);
            $err_msg = isset($decoded['error']['message']) ? $decoded['error']['message'] : "HTTP $http_code";
            return array('success' => false, 'content' => '', 'error' => $err_msg);
        }

        $decoded = json_decode($response, true);
        if (isset($decoded['content'][0]['text'])) {
            return array('success' => true, 'content' => $decoded['content'][0]['text'], 'error' => '');
        }

        return array('success' => false, 'content' => '', 'error' => 'Unexpected API response format.');
    }
}
