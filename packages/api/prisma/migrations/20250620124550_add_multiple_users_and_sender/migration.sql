/*
  Warnings:

  - You are about to drop the column `clerkUserId` on the `Conversation` table. All the data in the column will be lost.
  - Added the required column `senderId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Conversation_clerkUserId_idx";

-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "clerkUserId",
ADD COLUMN     "clerkUserIds" TEXT[];

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "senderId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Conversation_clerkUserIds_idx" ON "Conversation"("clerkUserIds");
