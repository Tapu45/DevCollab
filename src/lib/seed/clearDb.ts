import { PrismaClient } from "../../generated/prisma/index.js";

const prisma = new PrismaClient();

async function clearDb() {
  const models = [
    "userActivity",
    "platformStats",
    "apiKey",
    "notification",
    "report",
    "userAchievement",
    "achievement",
    "forumReply",
    "forumPost",
    "forumCategory",
    "eventParticipant",
    "event",
    "message",
    "chatParticipant",
    "chat",
    "projectCollaborator",
    "milestone",
    "comment",
    "task",
    "project",
    "skill",
    "endorsement",
    "connection",
    "session",
    "account",
    "verificationToken",
    "invoice",
    "subscription",
    "plan",
    "user"
  ];

  let totalDeleted = 0;

  for (const model of models) {
    // @ts-ignore
    const result = await prisma[model].deleteMany({});
    console.log(`Deleted ${result.count} records from ${model}`);
    totalDeleted += result.count;
  }

  console.log(`\nDatabase cleared! Total records deleted: ${totalDeleted}`);
}

clearDb()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());