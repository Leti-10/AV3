/*
  Warnings:

  - You are about to drop the column `autonomia` on the `aeronave` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `aeronave` DROP COLUMN `autonomia`,
    ADD COLUMN `alcance` INTEGER NOT NULL DEFAULT 0;
