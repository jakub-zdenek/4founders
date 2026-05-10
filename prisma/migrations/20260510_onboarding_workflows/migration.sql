-- Profile workflow fields for founder, mentor, and participant onboarding.
ALTER TABLE "FounderProfile"
ADD COLUMN "motivation" TEXT,
ADD COLUMN "supportNeeded" TEXT,
ADD COLUMN "teamBuildingInterest" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "ReviewerProfile"
ADD COLUMN "supportApproach" TEXT,
ADD COLUMN "supportAreas" TEXT,
ADD COLUMN "githubUrl" TEXT,
ADD COLUMN "passionStatement" TEXT;

ALTER TABLE "ExpertProfile"
ADD COLUMN "credibilityStatement" TEXT,
ADD COLUMN "supportApproach" TEXT,
ADD COLUMN "supportAreas" TEXT,
ADD COLUMN "githubUrl" TEXT,
ADD COLUMN "passionStatement" TEXT;

ALTER TABLE "Project"
ADD COLUMN "founderMotivation" TEXT,
ADD COLUMN "solutionApproach" TEXT,
ADD COLUMN "presentationUrl" TEXT,
ADD COLUMN "sharingPreference" TEXT,
ADD COLUMN "supportNeeded" TEXT,
ADD COLUMN "teamBuildingInterest" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "teamNeeds" TEXT;
