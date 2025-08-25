/*
  Warnings:

  - You are about to drop the `service_steps` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `step_details` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `steps` to the `services` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `service_steps` DROP FOREIGN KEY `service_steps_serviceId_fkey`;

-- DropForeignKey
ALTER TABLE `step_details` DROP FOREIGN KEY `step_details_serviceStepId_fkey`;

-- AlterTable
ALTER TABLE `services` ADD COLUMN `steps` TEXT NOT NULL;

-- DropTable
DROP TABLE `service_steps`;

-- DropTable
DROP TABLE `step_details`;
