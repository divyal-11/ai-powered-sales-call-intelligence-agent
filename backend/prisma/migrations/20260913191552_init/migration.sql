-- CreateTable
CREATE TABLE "Transcript" (
    "id" TEXT NOT NULL,
    "rawText" TEXT NOT NULL,
    "sourceMeta" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transcript_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentRun" (
    "id" TEXT NOT NULL,
    "transcriptId" TEXT NOT NULL,
    "step" TEXT NOT NULL,
    "inputSnapshot" JSONB,
    "outputRaw" JSONB,
    "model" TEXT,
    "latencyMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CallInsight" (
    "id" TEXT NOT NULL,
    "transcriptId" TEXT NOT NULL,
    "customerProblem" TEXT,
    "severity" TEXT,
    "currentSolution" TEXT,
    "buyingIntent" TEXT,
    "buyingIntentScore" INTEGER,
    "nextStep" TEXT,
    "leadScore" INTEGER,
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "missingFields" TEXT[],
    "fieldEvidence" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CallInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Objection" (
    "id" TEXT NOT NULL,
    "insightId" TEXT NOT NULL,
    "objection" TEXT NOT NULL,
    "category" TEXT,

    CONSTRAINT "Objection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FollowUp" (
    "id" TEXT NOT NULL,
    "insightId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FollowUp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CallInsight_transcriptId_key" ON "CallInsight"("transcriptId");

-- AddForeignKey
ALTER TABLE "AgentRun" ADD CONSTRAINT "AgentRun_transcriptId_fkey" FOREIGN KEY ("transcriptId") REFERENCES "Transcript"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallInsight" ADD CONSTRAINT "CallInsight_transcriptId_fkey" FOREIGN KEY ("transcriptId") REFERENCES "Transcript"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Objection" ADD CONSTRAINT "Objection_insightId_fkey" FOREIGN KEY ("insightId") REFERENCES "CallInsight"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_insightId_fkey" FOREIGN KEY ("insightId") REFERENCES "CallInsight"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
