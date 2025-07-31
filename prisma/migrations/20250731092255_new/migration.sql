/*
  Warnings:

  - You are about to drop the `service_steps` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `service_styles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `service_steps` DROP FOREIGN KEY `service_steps_serviceId_fkey`;

-- DropForeignKey
ALTER TABLE `service_styles` DROP FOREIGN KEY `service_styles_serviceId_fkey`;

-- DropTable
DROP TABLE `service_steps`;

-- DropTable
DROP TABLE `service_styles`;
