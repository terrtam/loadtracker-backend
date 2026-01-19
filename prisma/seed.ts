import 'dotenv/config';
import { PrismaClient, Side } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from "bcryptjs";

// Create an adapter for your database
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

// Construct the client with the adapter
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const user = await prisma.user.create({
    data: {
      email: "test@example.com",
      passwordHash,
    },
  });

  const knee = await prisma.bodyPartProfile.create({
    data: {
      user_id: user.id,
      bodyPartName: "knee",
      side: Side.left,
    },
  });

  const hip = await prisma.bodyPartProfile.create({
    data: {
      user_id: user.id,
      bodyPartName: "hip",
      side: Side.right,
    },
  });

  /* ------------------------
    SESSIONS (MULTI-WEEK)
  ------------------------- */

  const WEEKS = 10;
  const SESSIONS_PER_WEEK = 4;

  let sessionCount = 0;

  for (let week = 0; week < WEEKS; week++) {
    for (let day = 0; day < SESSIONS_PER_WEEK; day++) {
      const date = new Date();
      date.setDate(date.getDate() - sessionCount);

      const session = await prisma.session.create({
        data: {
          user_id: user.id,
          date,
        },
      });

      // strength load increases slowly week to week
      const baseWeight = 100 + week * 2.5;
      const rpeBase = 6 + (week % 3);

      await prisma.exerciseSet.createMany({
        data: [
          /* ---------- STRENGTH ---------- */
          {
            session_id: session.id,
            exercise_code: "BARBELL_BACK_SQUAT",
            reps: 5,
            weight: baseWeight,
            rpe: rpeBase,
          },
          {
            session_id: session.id,
            exercise_code: "BARBELL_BACK_SQUAT",
            reps: 5,
            weight: baseWeight + 5,
            rpe: rpeBase + 1,
          },

          /* ---------- PLYOMETRIC ---------- */
          {
            session_id: session.id,
            exercise_code: "DEPTH_JUMP",
            reps: 20 - (week % 3),
            rpe: 5 + (week % 2),
          },

          /* ---------- ISOMETRIC ---------- */
          {
            session_id: session.id,
            exercise_code: "SPANISH_SQUAT",
            duration: 45 + week * 3,
            rpe: 4 + (week % 2),
          },

          /* ---------- CARDIO ---------- */
          {
            session_id: session.id,
            exercise_code: "RUN",
            duration: 600 + week * 60,
            rpe: 4 + (week % 3),
          },
        ],
      });

      sessionCount++;
    }
  }

  /* ------------------------
    WELLNESS LOGS (8 WEEKS)
  ------------------------- */

  const DAYS = 56; // 8 weeks

  for (let i = 0; i < DAYS; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const week = Math.floor(i / 7);

    // ---- Fatigue (global pattern)
    const fatigueBase = 4 + (week % 3); // 4–6 weekly waves
    const fatigueNoise = i % 2 === 0 ? 0 : 1;

    // ---- Knee pain (gradual trend + flare)
    const kneePain =
      Math.min(
        7,
        3 + week * 0.3 + (i % 5 === 0 ? 1 : 0)
      );

    // ---- Hip pain (more stable)
    const hipPain =
      Math.max(
        1,
        2 + Math.sin(i / 10) * 0.5
      );

    await prisma.wellnessLog.createMany({
      data: [
        {
          user_id: user.id,
          body_part_profile_id: knee.id,
          logged_at: date,
          pain_score: Math.round(kneePain),
          fatigue_score: fatigueBase + fatigueNoise,
        },
        {
          user_id: user.id,
          body_part_profile_id: hip.id,
          logged_at: date,
          pain_score: Math.round(hipPain),
          fatigue_score: fatigueBase + fatigueNoise,
        },
      ],
    });
  }


  console.log("✅ Database seeded successfully");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
