-- CreateTable
CREATE TABLE `orders` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `note` VARCHAR(191) NULL,
    `input_file_url` VARCHAR(191) NULL,
    `output_file_url` VARCHAR(191) NULL,
    `status` TINYINT NOT NULL DEFAULT 0,
    `delete_flg` TINYINT NULL DEFAULT 0,
    `created_user` INTEGER NULL,
    `updated_user` INTEGER NULL,
    `created_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `serviceId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `price` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `services`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
