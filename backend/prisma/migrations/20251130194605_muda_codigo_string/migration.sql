/*
  Warnings:

  - The primary key for the `aeronave` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE `etapa` DROP FOREIGN KEY `Etapa_aeronaveId_fkey`;

-- DropForeignKey
ALTER TABLE `peca` DROP FOREIGN KEY `Peca_aeronaveId_fkey`;

-- DropForeignKey
ALTER TABLE `teste` DROP FOREIGN KEY `Teste_aeronaveId_fkey`;

-- DropIndex
DROP INDEX `Etapa_aeronaveId_fkey` ON `etapa`;

-- DropIndex
DROP INDEX `Peca_aeronaveId_fkey` ON `peca`;

-- DropIndex
DROP INDEX `Teste_aeronaveId_fkey` ON `teste`;

-- AlterTable
ALTER TABLE `aeronave` DROP PRIMARY KEY,
    MODIFY `codigo` VARCHAR(20) NOT NULL,
    ADD PRIMARY KEY (`codigo`);

-- AlterTable
ALTER TABLE `etapa` MODIFY `aeronaveId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `peca` MODIFY `aeronaveId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `teste` MODIFY `aeronaveId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Peca` ADD CONSTRAINT `Peca_aeronaveId_fkey` FOREIGN KEY (`aeronaveId`) REFERENCES `Aeronave`(`codigo`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Etapa` ADD CONSTRAINT `Etapa_aeronaveId_fkey` FOREIGN KEY (`aeronaveId`) REFERENCES `Aeronave`(`codigo`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Teste` ADD CONSTRAINT `Teste_aeronaveId_fkey` FOREIGN KEY (`aeronaveId`) REFERENCES `Aeronave`(`codigo`) ON DELETE RESTRICT ON UPDATE CASCADE;
