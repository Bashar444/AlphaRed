<?php

/**
 * Tamil (தமிழ்) language file for PrimoData Analytics.
 * Contains all PrimoData-specific translation keys.
 * Keys that don't have Tamil translations fall back to English.
 */

// Load the English file as base to ensure all keys exist
$lang = array();

// Phase 1 — Foundation
$lang["surveys"] = "ஆய்வுகள்";
$lang["survey"] = "ஆய்வு";
$lang["add_survey"] = "ஆய்வு சேர்";
$lang["edit_survey"] = "ஆய்வு திருத்து";
$lang["delete_survey"] = "ஆய்வு நீக்கு";
$lang["survey_builder"] = "ஆய்வு உருவாக்கி";
$lang["survey_limit_reached"] = "உங்கள் திட்டத்தின் ஆய்வு வரம்பை அடைந்துவிட்டீர்கள்.";
$lang["question_limit_reached"] = "ஒரு ஆய்வுக்கான கேள்வி வரம்பை அடைந்துவிட்டீர்கள்.";
$lang["respondents"] = "பதிலளிப்பவர்கள்";
$lang["responses"] = "பதில்கள்";
$lang["questions"] = "கேள்விகள்";
$lang["target_responses"] = "இலக்கு பதில்கள்";
$lang["featured_datasets"] = "சிறப்பு தரவுத்தொகுப்புகள்";
$lang["analysis_reports"] = "பகுப்பாய்வு அறிக்கைகள்";
$lang["export_data"] = "தரவு ஏற்றுமதி";
$lang["plan_upgrade_required"] = "இந்த அம்சத்தைப் பயன்படுத்த உங்கள் திட்டத்தை மேம்படுத்தவும்.";
$lang["ai_narrative"] = "AI விவரிப்பு";
$lang["api_access"] = "API அணுகல்";
$lang["launch_survey"] = "ஆய்வு தொடங்கு";
$lang["close_survey"] = "ஆய்வு மூடு";
$lang["draft"] = "வரைவு";
$lang["live"] = "நேரலை";
$lang["closed"] = "மூடப்பட்டது";

// Phase 2 — Core Product
$lang["join_as_respondent"] = "பதிலளிப்பவராகச் சேர்";
$lang["verify_phone"] = "தொலைபேசி சரிபார்";
$lang["otp_sent"] = "OTP உங்கள் தொலைபேசிக்கு அனுப்பப்பட்டது.";
$lang["invalid_otp"] = "தவறான அல்லது காலாவதியான OTP.";
$lang["phone_verified"] = "தொலைபேசி வெற்றிகரமாக சரிபார்க்கப்பட்டது.";
$lang["targeting"] = "இலக்கு";
$lang["estimated_reach"] = "மதிப்பிடப்பட்ட எட்டுதல்";
$lang["save_preset"] = "முன்அமைப்பாக சேமி";
$lang["load_preset"] = "முன்அமைப்பு ஏற்று";
$lang["quality_score"] = "தரம் மதிப்பெண்";
$lang["quality_high"] = "உயர் தரம்";
$lang["quality_medium"] = "நடுத்தர தரம்";
$lang["quality_low"] = "குறைந்த தரம்";
$lang["score_all_responses"] = "அனைத்து பதில்களையும் மதிப்பிடு";
$lang["survey_unavailable"] = "ஆய்வு கிடைக்கவில்லை.";
$lang["already_responded"] = "இந்த ஆய்வுக்கு ஏற்கனவே பதிலளித்துவிட்டீர்கள்.";
$lang["pre_launch_checklist"] = "முன்-தொடக்க சரிபார்ப்புப் பட்டியல்";

// Phase 3 — Analysis & Reports
$lang["analysis"] = "பகுப்பாய்வு";
$lang["run_analysis"] = "பகுப்பாய்வு இயக்கு";
$lang["descriptive_statistics"] = "விளக்க புள்ளியியல்";
$lang["correlation_matrix"] = "தொடர்புடைமை நிரல்";
$lang["completed_responses"] = "நிறைவடைந்த பதில்கள்";
$lang["avg_quality_score"] = "சராசரி தர மதிப்பெண்";
$lang["export"] = "ஏற்றுமதி";
$lang["csv"] = "CSV";
$lang["xls"] = "Excel (XLS)";
$lang["pdf"] = "PDF அறிக்கை";
$lang["zip"] = "முழு தொகுப்பு (ZIP)";
$lang["export_format_not_available"] = "இந்த ஏற்றுமதி வடிவம் உங்கள் திட்டத்தில் கிடைக்கவில்லை.";
$lang["regression_analysis"] = "பின்னடைவு பகுப்பாய்வு";
$lang["frequency_distribution"] = "அதிர்வெண் பகிர்வு";

// Phase 4 — Business Layer
$lang["subscription_plans"] = "சந்தா திட்டங்கள்";
$lang["current_plan"] = "தற்போதைய திட்டம்";
$lang["subscribe"] = "சந்தா செய்";
$lang["subscription_activated"] = "சந்தா வெற்றிகரமாக செயல்படுத்தப்பட்டது!";
$lang["subscription_cancelled"] = "சந்தா ரத்து செய்யப்பட்டது.";
$lang["month"] = "மாதம்";
$lang["responses_per_survey"] = "ஆய்வுக்கான பதில்கள்";
$lang["questions_per_survey"] = "ஆய்வுக்கான கேள்விகள்";
$lang["team_members"] = "குழு உறுப்பினர்கள்";
$lang["view_plans"] = "திட்டங்களைக் காண்";
$lang["api_keys"] = "API சாவிகள்";
$lang["generate_key"] = "சாவி உருவாக்கு";
$lang["api_key_generated"] = "API சாவி உருவாக்கப்பட்டது. இப்போது நகலெடுக்கவும் — மீண்டும் காட்டப்படாது.";
$lang["api_key_revoked"] = "API சாவி திரும்பப்பெறப்பட்டது.";
$lang["copy_key_warning"] = "இந்த சாவி ஒருமுறை மட்டுமே காட்டப்படும். இப்போது நகலெடுக்கவும்!";
$lang["enter_key_label"] = "இந்த API சாவிக்கு ஒரு பெயரிடுங்கள்:";
$lang["api_access_enterprise_only"] = "API அணுகல் நிறுவன திட்டத்தில் கிடைக்கும்.";
$lang["requests"] = "கோரிக்கைகள்";
$lang["last_used"] = "கடைசி பயன்பாடு";
$lang["label"] = "பெயர்";
$lang["copy"] = "நகலெடு";
$lang["created"] = "உருவாக்கப்பட்டது";
$lang["active"] = "செயலில்";
$lang["revoked"] = "திரும்பப்பெறப்பட்டது";

// Phase 5 — Admin
$lang["primo_admin_dashboard"] = "PrimoData நிர்வாக டாஷ்போர்டு";
$lang["total_revenue"] = "மொத்த வருமானம்";
$lang["active_subscriptions"] = "செயலில் உள்ள சந்தாக்கள்";
$lang["total_surveys"] = "மொத்த ஆய்வுகள்";
$lang["total_responses"] = "மொத்த பதில்கள்";
$lang["total_respondents"] = "மொத்த பதிலளிப்பவர்கள்";
$lang["plan_tiers"] = "திட்ட நிலைகள்";
$lang["mrr_by_tier"] = "நிலை வாரியான மாத வருமானம்";
$lang["usage_summary"] = "பயன்பாட்டு சுருக்கம்";
$lang["manage_respondents"] = "பதிலளிப்பவர்களை நிர்வகி";
$lang["manage_datasets"] = "தரவுத்தொகுப்புகளை நிர்வகி";
$lang["revenue_dashboard"] = "வருமான டாஷ்போர்டு";
$lang["monthly_revenue"] = "மாத வருமானம்";
$lang["metric"] = "அளவீடு";
$lang["total"] = "மொத்தம்";
$lang["name"] = "பெயர்";
$lang["phone"] = "தொலைபேசி";
$lang["age_group"] = "வயது குழு";
$lang["gender"] = "பாலினம்";
$lang["region"] = "பகுதி";
$lang["status"] = "நிலை";
$lang["joined"] = "சேர்ந்த தேதி";
$lang["title"] = "தலைப்பு";
$lang["category"] = "வகை";
$lang["views"] = "பார்வைகள்";
$lang["plan"] = "திட்டம்";
$lang["subscribers"] = "சந்தாதாரர்கள்";
$lang["revenue"] = "வருமானம்";
$lang["education"] = "கல்வி";
$lang["income"] = "வருமானம்";
$lang["response_history"] = "பதில் வரலாறு";

return $lang;
