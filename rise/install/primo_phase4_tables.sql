-- Phase 4: Business Layer Tables
-- Subscriptions, usage logs, API keys

CREATE TABLE IF NOT EXISTS `primo_subscriptions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `plan_key` varchar(50) NOT NULL DEFAULT 'basic',
  `plan_name` varchar(100) NOT NULL,
  `amount_inr` decimal(10,2) NOT NULL DEFAULT 0,
  `razorpay_order_id` varchar(255) DEFAULT NULL,
  `razorpay_payment_id` varchar(255) DEFAULT NULL,
  `razorpay_subscription_id` varchar(255) DEFAULT NULL,
  `status` enum('active','cancelled','expired','paused') DEFAULT 'active',
  `started_at` datetime DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `cancelled_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL,
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_user_status` (`user_id`, `status`),
  KEY `idx_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE IF NOT EXISTS `primo_usage_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `metric` varchar(100) NOT NULL COMMENT 'e.g. surveys_created, responses_collected, exports_generated',
  `period` varchar(7) NOT NULL COMMENT 'YYYY-MM format',
  `count` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL,
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_user_metric_period` (`user_id`, `metric`, `period`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

ALTER TABLE `primo_api_keys` ADD COLUMN IF NOT EXISTS `request_count` int(11) NOT NULL DEFAULT 0 AFTER `status`;
ALTER TABLE `primo_api_keys` ADD COLUMN IF NOT EXISTS `last_used_at` datetime DEFAULT NULL AFTER `request_count`;
ALTER TABLE `primo_api_keys` ADD COLUMN IF NOT EXISTS `revoked_at` datetime DEFAULT NULL AFTER `last_used_at`;
