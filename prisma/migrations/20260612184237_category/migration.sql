/*
  Warnings:

  - The values [CHEF,CASHIER] on the enum `users_role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `categories` ADD COLUMN `description` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `users` MODIFY `role` ENUM('ADMIN', 'MANAGER', 'WAITER', 'CLIENT', 'GUEST') NOT NULL DEFAULT 'GUEST';
