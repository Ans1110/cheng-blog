CREATE TABLE `note_categories` (
	`id` varchar(100) NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`icon` varchar(100),
	`created_at` timestamp DEFAULT '2025-12-30 15:45:31.980',
	`updated_at` timestamp DEFAULT '2025-12-30 15:45:31.980',
	CONSTRAINT `note_categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`token` varchar(255) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `sessions_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
ALTER TABLE `learning_experiences` MODIFY COLUMN `created_at` timestamp DEFAULT '2025-12-30 15:45:31.980';--> statement-breakpoint
ALTER TABLE `learning_experiences` MODIFY COLUMN `updated_at` timestamp DEFAULT '2025-12-30 15:45:31.980';--> statement-breakpoint
ALTER TABLE `notes` MODIFY COLUMN `created_at` timestamp DEFAULT '2025-12-30 15:45:31.979';--> statement-breakpoint
ALTER TABLE `notes` MODIFY COLUMN `updated_at` timestamp DEFAULT '2025-12-30 15:45:31.979';--> statement-breakpoint
ALTER TABLE `projects` MODIFY COLUMN `created_at` timestamp DEFAULT '2025-12-30 15:45:31.980';--> statement-breakpoint
ALTER TABLE `projects` MODIFY COLUMN `updated_at` timestamp DEFAULT '2025-12-30 15:45:31.980';--> statement-breakpoint
CREATE INDEX `sessions_token_idx` ON `sessions` (`token`);