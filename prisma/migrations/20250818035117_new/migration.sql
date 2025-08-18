-- DropForeignKey
ALTER TABLE `service_steps` DROP FOREIGN KEY `service_steps_serviceId_fkey`;

-- DropForeignKey
ALTER TABLE `step_details` DROP FOREIGN KEY `step_details_serviceStepId_fkey`;

-- AlterTable
ALTER TABLE `setting` MODIFY `value` TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE `service_steps` ADD CONSTRAINT `service_steps_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `services`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `step_details` ADD CONSTRAINT `step_details_serviceStepId_fkey` FOREIGN KEY (`serviceStepId`) REFERENCES `service_steps`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
