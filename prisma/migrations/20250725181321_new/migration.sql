-- CreateTable
CREATE TABLE `services` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(500) NOT NULL,
    `content` TEXT NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `status` TINYINT NOT NULL DEFAULT 0,
    `type` TINYINT NOT NULL DEFAULT 0,
    `original_price` DOUBLE NULL,
    `discounted_price` DOUBLE NULL,
    `rating` DOUBLE NULL,
    `order_count` INTEGER NULL,
    `authorId` INTEGER NOT NULL,
    `delete_flg` TINYINT NULL DEFAULT 0,
    `created_user` INTEGER NULL,
    `updated_user` INTEGER NULL,
    `created_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `services_slug_key`(`slug`),
    INDEX `services_slug_idx`(`slug`),
    INDEX `services_status_idx`(`status`),
    INDEX `services_created_time_idx`(`created_time`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `service_images` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `before_url` VARCHAR(1000) NULL,
    `after_url` VARCHAR(1000) NULL,
    `serviceId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `service_styles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `before_url` VARCHAR(1000) NULL,
    `after_url` VARCHAR(1000) NULL,
    `serviceId` INTEGER NOT NULL,
    `type` TINYINT NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `service_steps` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `content` TEXT NOT NULL,
    `before_url` VARCHAR(1000) NULL,
    `after_url` VARCHAR(1000) NULL,
    `serviceId` INTEGER NOT NULL,
    `sort_order` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `service_ideal_fors` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `label` VARCHAR(255) NOT NULL,
    `serviceId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `service_includes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `label` VARCHAR(255) NOT NULL,
    `serviceId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `service_add_ons` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `serviceId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `services` ADD CONSTRAINT `services_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_images` ADD CONSTRAINT `service_images_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `services`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_styles` ADD CONSTRAINT `service_styles_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `services`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_steps` ADD CONSTRAINT `service_steps_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `services`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_ideal_fors` ADD CONSTRAINT `service_ideal_fors_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `services`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_includes` ADD CONSTRAINT `service_includes_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `services`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_add_ons` ADD CONSTRAINT `service_add_ons_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `services`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
