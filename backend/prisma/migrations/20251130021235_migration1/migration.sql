/*
  Warnings:

  - You are about to drop the column `login` on the `funcionario` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[usuario]` on the table `Funcionario` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `usuario` to the `Funcionario` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Funcionario_login_key` ON `funcionario`;

-- AlterTable
ALTER TABLE `funcionario` DROP COLUMN `login`,
    ADD COLUMN `usuario` VARCHAR(100) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Funcionario_usuario_key` ON `Funcionario`(`usuario`);
