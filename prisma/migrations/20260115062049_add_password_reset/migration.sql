-- CreateEnum
CREATE TYPE "Side" AS ENUM ('left', 'right');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "resetTokenHash" TEXT,
    "resetTokenExp" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BodyPartProfile" (
    "body_part_profile_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "body_part_name" TEXT NOT NULL,
    "side" "Side" NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "archived_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BodyPartProfile_pkey" PRIMARY KEY ("body_part_profile_id")
);

-- CreateTable
CREATE TABLE "Session" (
    "session_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("session_id")
);

-- CreateTable
CREATE TABLE "ExerciseSet" (
    "exercise_set_id" SERIAL NOT NULL,
    "session_id" INTEGER NOT NULL,
    "exercise_code" TEXT NOT NULL,
    "reps" INTEGER,
    "weight" DOUBLE PRECISION,
    "duration" INTEGER,
    "rpe" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExerciseSet_pkey" PRIMARY KEY ("exercise_set_id")
);

-- CreateTable
CREATE TABLE "WellnessLog" (
    "wellness_log_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "body_part_profile_id" INTEGER NOT NULL,
    "logged_at" TIMESTAMP(3) NOT NULL,
    "pain_score" INTEGER NOT NULL,
    "fatigue_score" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WellnessLog_pkey" PRIMARY KEY ("wellness_log_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "BodyPartProfile_user_id_body_part_name_side_key" ON "BodyPartProfile"("user_id", "body_part_name", "side");

-- AddForeignKey
ALTER TABLE "BodyPartProfile" ADD CONSTRAINT "BodyPartProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseSet" ADD CONSTRAINT "ExerciseSet_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "Session"("session_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WellnessLog" ADD CONSTRAINT "WellnessLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WellnessLog" ADD CONSTRAINT "WellnessLog_body_part_profile_id_fkey" FOREIGN KEY ("body_part_profile_id") REFERENCES "BodyPartProfile"("body_part_profile_id") ON DELETE CASCADE ON UPDATE CASCADE;
