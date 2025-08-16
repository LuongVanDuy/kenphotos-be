/*
  Warnings:

  - You are about to drop the column `password_changed_at` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `services` ADD COLUMN `is_feature` DOUBLE NULL,
    ADD COLUMN `video_url` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `password_changed_at`;

-- CreateTable
CREATE TABLE `service_steps` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `before_url` VARCHAR(1000) NULL,
    `after_url` VARCHAR(1000) NULL,
    `video_url` VARCHAR(1000) NULL,
    `serviceId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `step_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `content` TEXT NULL,
    `before_url` VARCHAR(1000) NULL,
    `after_url` VARCHAR(1000) NULL,
    `serviceStepId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `service_steps` ADD CONSTRAINT `service_steps_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `services`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `step_details` ADD CONSTRAINT `step_details_serviceStepId_fkey` FOREIGN KEY (`serviceStepId`) REFERENCES `service_steps`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
