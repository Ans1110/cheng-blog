CREATE TABLE `admin` (
	`id` int AUTO_INCREMENT NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	CONSTRAINT `admin_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `learning_experiences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`year` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`skills` json DEFAULT ('[]'),
	`created_at` timestamp DEFAULT '2025-12-24 09:21:47.323',
	`updated_at` timestamp DEFAULT '2025-12-24 09:21:47.323',
	CONSTRAINT `learning_experiences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`category` varchar(100) NOT NULL,
	`tags` json DEFAULT ('[]'),
	`created_at` timestamp DEFAULT '2025-12-24 09:21:47.321',
	`updated_at` timestamp DEFAULT '2025-12-24 09:21:47.322',
	CONSTRAINT `notes_id` PRIMARY KEY(`id`),
	CONSTRAINT `notes_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`excerpt` text,
	`tags` json DEFAULT ('[]'),
	`published` boolean DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `posts_id` PRIMARY KEY(`id`),
	CONSTRAINT `posts_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`tags` json DEFAULT ('[]'),
	`image_url` varchar(255),
	`project_url` varchar(255),
	`github_url` varchar(255),
	`created_at` timestamp DEFAULT '2025-12-24 09:21:47.323',
	`updated_at` timestamp DEFAULT '2025-12-24 09:21:47.323',
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `learning_experiences_year_idx` ON `learning_experiences` (`year`);--> statement-breakpoint
CREATE INDEX `notes_created_at_idx` ON `notes` (`created_at`);--> statement-breakpoint
CREATE INDEX `notes_category_idx` ON `notes` (`category`);--> statement-breakpoint
CREATE INDEX `posts_published_idx` ON `posts` (`published`);--> statement-breakpoint
CREATE INDEX `posts_created_at_idx` ON `posts` (`created_at`);--> statement-breakpoint
CREATE INDEX `projects_created_at_idx` ON `projects` (`created_at`);