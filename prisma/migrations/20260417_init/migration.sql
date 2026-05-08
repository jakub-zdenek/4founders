-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('FOUNDER', 'REVIEWER', 'TRUSTED_REVIEWER', 'SENIOR_EXPERT', 'ADMIN', 'MODERATOR');
CREATE TYPE "VisibilityMode" AS ENUM ('PUBLIC', 'LIMITED', 'PROTECTED', 'EXPERT_ONLY');
CREATE TYPE "ProjectStage" AS ENUM ('DRAFT', 'UNDER_REVIEW', 'IMPROVING', 'CATEGORY_STRONG', 'LAUNCH_CANDIDATE', 'EXPERT_FINALIZATION', 'READY_FOR_GO_LIVE');
CREATE TYPE "ReviewStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'FLAGGED', 'ARCHIVED');
CREATE TYPE "ConfidenceLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE "ModerationStatus" AS ENUM ('OPEN', 'INVESTIGATING', 'RESOLVED', 'DISMISSED');
CREATE TYPE "BadgeType" AS ENUM ('QUALITY', 'CONSISTENCY', 'IMPROVER', 'TRUST', 'LEADERBOARD');
CREATE TYPE "VoteType" AS ENUM ('COMPARATIVE', 'CONFIDENCE', 'IMPROVEMENT');
CREATE TYPE "RubricDimension" AS ENUM ('PROBLEM_CLARITY', 'VALUE_PROPOSITION_CLARITY', 'PRODUCT_USABILITY', 'TECHNICAL_QUALITY', 'DOCUMENTATION_QUALITY', 'DIFFERENTIATION', 'ADOPTION_READINESS', 'LAUNCH_READINESS', 'IMPROVEMENT_RESPONSIVENESS', 'TRUST_AND_SAFETY_HYGIENE');
CREATE TYPE "AssetType" AS ENUM ('SCREENSHOT', 'VIDEO', 'DOC', 'LINK', 'BUILD', 'ARCHITECTURE_NOTE', 'ROADMAP', 'DEPLOYMENT_NOTE');
CREATE TYPE "SupportRequestStatus" AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED');
CREATE TYPE "LaunchRecommendation" AS ENUM ('NOT_READY', 'READY_WITH_FIXES', 'READY_FOR_GO_LIVE');
CREATE TYPE "NotificationType" AS ENUM ('REVIEW_SUBMITTED', 'ACCESS_REQUEST', 'MODERATION_ALERT', 'EXPERT_UPDATE', 'SYSTEM');

-- CreateTable
CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT,
  "name" TEXT NOT NULL,
  "image" TEXT,
  "githubUsername" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Role" (
  "id" TEXT NOT NULL,
  "type" "RoleType" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserRole" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "roleId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FounderProfile" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "tagline" TEXT,
  "organization" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FounderProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReviewerProfile" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "trustScore" INTEGER NOT NULL DEFAULT 0,
  "reputationScore" INTEGER NOT NULL DEFAULT 0,
  "reviewCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ReviewerProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ExpertProfile" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "specialty" TEXT NOT NULL,
  "yearsExperience" INTEGER NOT NULL DEFAULT 10,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ExpertProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Category" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Project" (
  "id" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "valueProposition" TEXT NOT NULL,
  "targetUser" TEXT NOT NULL,
  "productStage" TEXT NOT NULL,
  "githubRepoUrl" TEXT NOT NULL,
  "websiteUrl" TEXT,
  "contactInfo" TEXT,
  "privateTestCredentials" TEXT,
  "problemStatement" TEXT NOT NULL,
  "differentiationStatement" TEXT NOT NULL,
  "preferredFeedbackFocus" TEXT NOT NULL,
  "visibilityMode" "VisibilityMode" NOT NULL DEFAULT 'PROTECTED',
  "stage" "ProjectStage" NOT NULL DEFAULT 'DRAFT',
  "isFeaturedPublic" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VisibilityPolicy" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "defaultVisibility" "VisibilityMode" NOT NULL DEFAULT 'PROTECTED',
  "productDescriptionLevel" "VisibilityMode" NOT NULL DEFAULT 'LIMITED',
  "screenshotsLevel" "VisibilityMode" NOT NULL DEFAULT 'PROTECTED',
  "walkthroughVideoLevel" "VisibilityMode" NOT NULL DEFAULT 'PROTECTED',
  "demoLinkLevel" "VisibilityMode" NOT NULL DEFAULT 'LIMITED',
  "privateBuildAccessLevel" "VisibilityMode" NOT NULL DEFAULT 'EXPERT_ONLY',
  "architectureNotesLevel" "VisibilityMode" NOT NULL DEFAULT 'EXPERT_ONLY',
  "githubVisibilityLevel" "VisibilityMode" NOT NULL DEFAULT 'EXPERT_ONLY',
  "roadmapLevel" "VisibilityMode" NOT NULL DEFAULT 'PROTECTED',
  "differentiatingFeaturesLevel" "VisibilityMode" NOT NULL DEFAULT 'PROTECTED',
  "deploymentDetailsLevel" "VisibilityMode" NOT NULL DEFAULT 'EXPERT_ONLY',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "VisibilityPolicy_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProjectVersion" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "versionNumber" INTEGER NOT NULL,
  "changelog" TEXT,
  "launchGoals" TEXT,
  "knownWeaknesses" TEXT,
  "privateReviewerNotes" TEXT,
  "waitlistLink" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProjectVersion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Asset" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "versionId" TEXT,
  "type" "AssetType" NOT NULL,
  "label" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "visibilityMode" "VisibilityMode" NOT NULL,
  "isSensitive" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AssetPermission" (
  "id" TEXT NOT NULL,
  "assetId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "canView" BOOLEAN NOT NULL DEFAULT true,
  "canDownload" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AssetPermission_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Review" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "projectVersionId" TEXT,
  "reviewerId" TEXT NOT NULL,
  "status" "ReviewStatus" NOT NULL DEFAULT 'SUBMITTED',
  "confidenceLevel" "ConfidenceLevel" NOT NULL,
  "whatWorks" TEXT NOT NULL,
  "whatIsWeak" TEXT NOT NULL,
  "whatIsUnclear" TEXT NOT NULL,
  "highestPriorityImprovement" TEXT NOT NULL,
  "weightedScore" DOUBLE PRECISION,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReviewDimensionScore" (
  "id" TEXT NOT NULL,
  "reviewId" TEXT NOT NULL,
  "dimension" "RubricDimension" NOT NULL,
  "score" INTEGER NOT NULL,
  "rationale" TEXT NOT NULL,
  CONSTRAINT "ReviewDimensionScore_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FeedbackTheme" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "theme" TEXT NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FeedbackTheme_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Vote" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" "VoteType" NOT NULL,
  "value" INTEGER NOT NULL,
  "confidence" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReputationEvent" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "delta" INTEGER NOT NULL,
  "reason" TEXT NOT NULL,
  "contextJson" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ReputationEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Badge" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "type" "BadgeType" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserBadge" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "badgeId" TEXT NOT NULL,
  "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserBadge_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AccessLog" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "assetId" TEXT,
  "actorId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "metadata" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AccessLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ModerationCase" (
  "id" TEXT NOT NULL,
  "projectId" TEXT,
  "reviewId" TEXT,
  "reporterId" TEXT NOT NULL,
  "assignedAdminId" TEXT,
  "status" "ModerationStatus" NOT NULL DEFAULT 'OPEN',
  "reason" TEXT NOT NULL,
  "resolution" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ModerationCase_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ExpertSupportRequest" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "founderId" TEXT NOT NULL,
  "status" "SupportRequestStatus" NOT NULL DEFAULT 'REQUESTED',
  "requestNote" TEXT NOT NULL,
  "founderDisclosure" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ExpertSupportRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LaunchReadinessAssessment" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "expertId" TEXT NOT NULL,
  "supportRequestId" TEXT,
  "blockers" TEXT NOT NULL,
  "fixes" TEXT NOT NULL,
  "recommendation" "LaunchRecommendation" NOT NULL,
  "founderFollowUp" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LaunchReadinessAssessment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Notification" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" "NotificationType" NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "readAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DisclosureRequest" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "requesterId" TEXT NOT NULL,
  "decidedById" TEXT,
  "requestedLevel" "VisibilityMode" NOT NULL,
  "notes" TEXT,
  "approved" BOOLEAN,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "decidedAt" TIMESTAMP(3),
  CONSTRAINT "DisclosureRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Account" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INTEGER,
  "token_type" TEXT,
  "scope" TEXT,
  "id_token" TEXT,
  "session_state" TEXT,
  CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Session" (
  "id" TEXT NOT NULL,
  "sessionToken" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VerificationToken" (
  "identifier" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL
);

-- Indexes
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Role_type_key" ON "Role"("type");
CREATE UNIQUE INDEX "UserRole_userId_roleId_key" ON "UserRole"("userId", "roleId");
CREATE UNIQUE INDEX "FounderProfile_userId_key" ON "FounderProfile"("userId");
CREATE UNIQUE INDEX "ReviewerProfile_userId_key" ON "ReviewerProfile"("userId");
CREATE UNIQUE INDEX "ExpertProfile_userId_key" ON "ExpertProfile"("userId");
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");
CREATE UNIQUE INDEX "VisibilityPolicy_projectId_key" ON "VisibilityPolicy"("projectId");
CREATE UNIQUE INDEX "ProjectVersion_projectId_versionNumber_key" ON "ProjectVersion"("projectId", "versionNumber");
CREATE UNIQUE INDEX "AssetPermission_assetId_userId_key" ON "AssetPermission"("assetId", "userId");
CREATE UNIQUE INDEX "ReviewDimensionScore_reviewId_dimension_key" ON "ReviewDimensionScore"("reviewId", "dimension");
CREATE UNIQUE INDEX "Badge_key_key" ON "Badge"("key");
CREATE UNIQUE INDEX "UserBadge_userId_badgeId_key" ON "UserBadge"("userId", "badgeId");
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- FKs
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FounderProfile" ADD CONSTRAINT "FounderProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReviewerProfile" ADD CONSTRAINT "ReviewerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExpertProfile" ADD CONSTRAINT "ExpertProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Project" ADD CONSTRAINT "Project_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Project" ADD CONSTRAINT "Project_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "VisibilityPolicy" ADD CONSTRAINT "VisibilityPolicy_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectVersion" ADD CONSTRAINT "ProjectVersion_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "ProjectVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AssetPermission" ADD CONSTRAINT "AssetPermission_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AssetPermission" ADD CONSTRAINT "AssetPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_projectVersionId_fkey" FOREIGN KEY ("projectVersionId") REFERENCES "ProjectVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReviewDimensionScore" ADD CONSTRAINT "ReviewDimensionScore_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FeedbackTheme" ADD CONSTRAINT "FeedbackTheme_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReputationEvent" ADD CONSTRAINT "ReputationEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AccessLog" ADD CONSTRAINT "AccessLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AccessLog" ADD CONSTRAINT "AccessLog_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AccessLog" ADD CONSTRAINT "AccessLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ModerationCase" ADD CONSTRAINT "ModerationCase_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ModerationCase" ADD CONSTRAINT "ModerationCase_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ModerationCase" ADD CONSTRAINT "ModerationCase_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ModerationCase" ADD CONSTRAINT "ModerationCase_assignedAdminId_fkey" FOREIGN KEY ("assignedAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ExpertSupportRequest" ADD CONSTRAINT "ExpertSupportRequest_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExpertSupportRequest" ADD CONSTRAINT "ExpertSupportRequest_founderId_fkey" FOREIGN KEY ("founderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LaunchReadinessAssessment" ADD CONSTRAINT "LaunchReadinessAssessment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LaunchReadinessAssessment" ADD CONSTRAINT "LaunchReadinessAssessment_expertId_fkey" FOREIGN KEY ("expertId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LaunchReadinessAssessment" ADD CONSTRAINT "LaunchReadinessAssessment_supportRequestId_fkey" FOREIGN KEY ("supportRequestId") REFERENCES "ExpertSupportRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DisclosureRequest" ADD CONSTRAINT "DisclosureRequest_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DisclosureRequest" ADD CONSTRAINT "DisclosureRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DisclosureRequest" ADD CONSTRAINT "DisclosureRequest_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
