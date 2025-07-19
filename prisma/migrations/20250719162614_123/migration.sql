-- CreateTable
CREATE TABLE `email_verify` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(320) NOT NULL,
    `verify_token` VARCHAR(256) NULL,

    UNIQUE INDEX `email_verify_email_key`(`email`),
    UNIQUE INDEX `email_verify_verify_token_key`(`verify_token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
