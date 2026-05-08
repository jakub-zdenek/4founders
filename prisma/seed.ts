import {
  AssetType,
  BadgeType,
  ConfidenceLevel,
  LaunchRecommendation,
  ModerationStatus,
  NotificationType,
  PrismaClient,
  ProjectStage,
  RoleType,
  RubricDimension,
  SupportRequestStatus,
  VisibilityMode,
  VoteType,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const dimensionList: RubricDimension[] = [
  RubricDimension.PROBLEM_CLARITY,
  RubricDimension.VALUE_PROPOSITION_CLARITY,
  RubricDimension.PRODUCT_USABILITY,
  RubricDimension.TECHNICAL_QUALITY,
  RubricDimension.DOCUMENTATION_QUALITY,
  RubricDimension.DIFFERENTIATION,
  RubricDimension.ADOPTION_READINESS,
  RubricDimension.LAUNCH_READINESS,
  RubricDimension.IMPROVEMENT_RESPONSIVENESS,
  RubricDimension.TRUST_AND_SAFETY_HYGIENE,
];

async function resetDatabase() {
  await prisma.notification.deleteMany();
  await prisma.launchReadinessAssessment.deleteMany();
  await prisma.expertSupportRequest.deleteMany();
  await prisma.moderationCase.deleteMany();
  await prisma.accessLog.deleteMany();
  await prisma.userBadge.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.reputationEvent.deleteMany();
  await prisma.vote.deleteMany();
  await prisma.feedbackTheme.deleteMany();
  await prisma.reviewDimensionScore.deleteMany();
  await prisma.review.deleteMany();
  await prisma.assetPermission.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.projectVersion.deleteMany();
  await prisma.visibilityPolicy.deleteMany();
  await prisma.disclosureRequest.deleteMany();
  await prisma.project.deleteMany();
  await prisma.category.deleteMany();
  await prisma.expertProfile.deleteMany();
  await prisma.reviewerProfile.deleteMany();
  await prisma.founderProfile.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.role.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
}

async function seedRoles() {
  for (const type of Object.values(RoleType)) {
    await prisma.role.upsert({
      where: { type },
      update: {},
      create: { type },
    });
  }
}

async function seedUsers() {
  const password = await bcrypt.hash("Demo123!", 10);

  const userSpecs: Array<{ email: string; name: string; roles: RoleType[] }> = [
    { email: "founder@4founders.dev", name: "Maya Founder", roles: [RoleType.FOUNDER] },
    { email: "founder2@4founders.dev", name: "Noah Founder", roles: [RoleType.FOUNDER] },
    { email: "reviewer@4founders.dev", name: "Rae Reviewer", roles: [RoleType.REVIEWER] },
    {
      email: "trusted@4founders.dev",
      name: "Tariq Trusted",
      roles: [RoleType.REVIEWER, RoleType.TRUSTED_REVIEWER],
    },
    { email: "expert@4founders.dev", name: "Elena Expert", roles: [RoleType.SENIOR_EXPERT] },
    {
      email: "admin@4founders.dev",
      name: "Alex Admin",
      roles: [RoleType.ADMIN, RoleType.MODERATOR],
    },
  ];

  const users: Record<string, string> = {};

  for (const spec of userSpecs) {
    const user = await prisma.user.create({
      data: {
        email: spec.email,
        name: spec.name,
        passwordHash: password,
      },
    });

    users[spec.email] = user.id;

    for (const roleType of spec.roles) {
      const role = await prisma.role.findUniqueOrThrow({ where: { type: roleType } });
      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: role.id,
        },
      });
    }

    if (spec.roles.includes(RoleType.FOUNDER)) {
      await prisma.founderProfile.create({
        data: {
          userId: user.id,
          tagline: "Building software with durable real-world impact",
        },
      });
    }

    if (spec.roles.includes(RoleType.REVIEWER) || spec.roles.includes(RoleType.TRUSTED_REVIEWER)) {
      await prisma.reviewerProfile.create({
        data: {
          userId: user.id,
          trustScore: spec.roles.includes(RoleType.TRUSTED_REVIEWER) ? 85 : 45,
          reputationScore: spec.roles.includes(RoleType.TRUSTED_REVIEWER) ? 92 : 54,
          reviewCount: spec.roles.includes(RoleType.TRUSTED_REVIEWER) ? 34 : 12,
        },
      });
    }

    if (spec.roles.includes(RoleType.SENIOR_EXPERT)) {
      await prisma.expertProfile.create({
        data: {
          userId: user.id,
          specialty: "Launch architecture and technical due diligence",
          yearsExperience: 14,
        },
      });
    }
  }

  return users;
}

async function seedCategories() {
  const categories = [
    {
      slug: "developer-productivity",
      name: "Developer Productivity",
      description: "Tools that materially improve software team output and focus.",
    },
    {
      slug: "ai-builder-tools",
      name: "AI Builder Tools",
      description: "Products that help developers build, evaluate, and ship AI software.",
    },
    {
      slug: "frontend-ux-tools",
      name: "Frontend and UX Tools",
      description: "Products improving frontend quality, UX systems, and usability outcomes.",
    },
    {
      slug: "data-infrastructure-tools",
      name: "Data and Infrastructure Tools",
      description: "Products for backend, observability, data operations, and infrastructure quality.",
    },
  ] as const;

  const results: Record<string, string> = {};
  for (const category of categories) {
    const created = await prisma.category.create({ data: category });
    results[category.slug] = created.id;
  }

  return results;
}

async function seedProjects(users: Record<string, string>, categories: Record<string, string>) {
  const founderA = users["founder@4founders.dev"];
  const founderB = users["founder2@4founders.dev"];

  const projects = [
    {
      slug: "flowforge",
      name: "FlowForge",
      valueProposition: "Automates daily dev handoff quality checks.",
      categoryId: categories["developer-productivity"],
      ownerId: founderA,
      stage: ProjectStage.IMPROVING,
      visibilityMode: VisibilityMode.PROTECTED,
    },
    {
      slug: "shiplens",
      name: "ShipLens",
      valueProposition: "Deploy intelligence for launch blockers before production.",
      categoryId: categories["data-infrastructure-tools"],
      ownerId: founderA,
      stage: ProjectStage.LAUNCH_CANDIDATE,
      visibilityMode: VisibilityMode.LIMITED,
    },
    {
      slug: "promptgrid",
      name: "PromptGrid",
      valueProposition: "Structured experiment tracking for prompt-based features.",
      categoryId: categories["ai-builder-tools"],
      ownerId: founderA,
      stage: ProjectStage.UNDER_REVIEW,
      visibilityMode: VisibilityMode.PROTECTED,
    },
    {
      slug: "uxcheckpoint",
      name: "UXCheckpoint",
      valueProposition: "UX regression map that explains conversion risk.",
      categoryId: categories["frontend-ux-tools"],
      ownerId: founderA,
      stage: ProjectStage.CATEGORY_STRONG,
      visibilityMode: VisibilityMode.PUBLIC,
    },
    {
      slug: "devpulse",
      name: "DevPulse",
      valueProposition: "Engineering productivity analytics with privacy-safe telemetry.",
      categoryId: categories["developer-productivity"],
      ownerId: founderB,
      stage: ProjectStage.UNDER_REVIEW,
      visibilityMode: VisibilityMode.LIMITED,
    },
    {
      slug: "agenttrial",
      name: "AgentTrial",
      valueProposition: "Safe rollout controls for autonomous AI workflows.",
      categoryId: categories["ai-builder-tools"],
      ownerId: founderB,
      stage: ProjectStage.EXPERT_FINALIZATION,
      visibilityMode: VisibilityMode.EXPERT_ONLY,
    },
    {
      slug: "pixelatlas",
      name: "PixelAtlas",
      valueProposition: "Design system operations and UX debt scoring.",
      categoryId: categories["frontend-ux-tools"],
      ownerId: founderB,
      stage: ProjectStage.IMPROVING,
      visibilityMode: VisibilityMode.PROTECTED,
    },
    {
      slug: "infraecho",
      name: "InfraEcho",
      valueProposition: "Incident memory and operational learning intelligence.",
      categoryId: categories["data-infrastructure-tools"],
      ownerId: founderB,
      stage: ProjectStage.READY_FOR_GO_LIVE,
      visibilityMode: VisibilityMode.PUBLIC,
    },
  ] as const;

  const created: Record<string, string> = {};

  for (let i = 0; i < projects.length; i += 1) {
    const p = projects[i];
    const project = await prisma.project.create({
      data: {
        ownerId: p.ownerId,
        categoryId: p.categoryId,
        slug: p.slug,
        name: p.name,
        valueProposition: p.valueProposition,
        targetUser: "Software teams shipping early product in competitive markets",
        productStage: "Pre-launch",
        githubRepoUrl: `https://github.com/demo/${p.slug}`,
        websiteUrl: `https://${p.slug}.example.com`,
        contactInfo: `${p.slug}@example.com`,
        privateTestCredentials: "test-user / demo-pass",
        problemStatement:
          "Founders need structured, credible feedback without exposing sensitive details too early.",
        differentiationStatement:
          "Combines protected disclosure controls with weighted reviewer quality signals.",
        preferredFeedbackFocus: "Launch readiness, UX clarity, and technical risk reduction",
        visibilityMode: p.visibilityMode,
        stage: p.stage,
        isFeaturedPublic: i % 3 === 0,
      },
    });

    created[p.slug] = project.id;

    await prisma.visibilityPolicy.create({
      data: {
        projectId: project.id,
        defaultVisibility: p.visibilityMode,
        productDescriptionLevel: VisibilityMode.LIMITED,
        screenshotsLevel: VisibilityMode.PROTECTED,
        walkthroughVideoLevel: VisibilityMode.PROTECTED,
        demoLinkLevel: VisibilityMode.LIMITED,
        privateBuildAccessLevel: VisibilityMode.EXPERT_ONLY,
        architectureNotesLevel: VisibilityMode.EXPERT_ONLY,
        githubVisibilityLevel: VisibilityMode.EXPERT_ONLY,
        roadmapLevel: VisibilityMode.PROTECTED,
        differentiatingFeaturesLevel: VisibilityMode.PROTECTED,
        deploymentDetailsLevel: VisibilityMode.EXPERT_ONLY,
      },
    });

    const v1 = await prisma.projectVersion.create({
      data: {
        projectId: project.id,
        versionNumber: 1,
        changelog: "Initial submission",
        knownWeaknesses: "Onboarding and docs need improvement",
        launchGoals: "Secure first 20 pilot users",
      },
    });

    const v2 = await prisma.projectVersion.create({
      data: {
        projectId: project.id,
        versionNumber: 2,
        changelog: "Improved docs, clarified value prop, tightened trust controls",
        privateReviewerNotes: "Focusing on adoption and launch readiness",
        waitlistLink: `https://${p.slug}.example.com/waitlist`,
      },
    });

    await prisma.asset.createMany({
      data: [
        {
          projectId: project.id,
          versionId: v2.id,
          type: AssetType.SCREENSHOT,
          label: "Dashboard preview",
          url: `https://cdn.example.com/${p.slug}/dashboard.png`,
          visibilityMode: VisibilityMode.LIMITED,
          isSensitive: false,
        },
        {
          projectId: project.id,
          versionId: v2.id,
          type: AssetType.ARCHITECTURE_NOTE,
          label: "System design",
          url: `https://cdn.example.com/${p.slug}/architecture.pdf`,
          visibilityMode: VisibilityMode.EXPERT_ONLY,
          isSensitive: true,
        },
      ],
    });

    await prisma.feedbackTheme.createMany({
      data: [
        { projectId: project.id, theme: "Documentation clarity", count: 3 },
        { projectId: project.id, theme: "User onboarding", count: 2 },
        { projectId: project.id, theme: "Differentiation narrative", count: 2 },
      ],
    });
  }

  return created;
}

async function seedReviews(users: Record<string, string>, projects: Record<string, string>) {
  const reviewer = users["reviewer@4founders.dev"];
  const trusted = users["trusted@4founders.dev"];

  const projectIds = Object.values(projects);

  for (let i = 0; i < projectIds.length; i += 1) {
    const projectId = projectIds[i];
    const version = await prisma.projectVersion.findFirstOrThrow({
      where: { projectId, versionNumber: 2 },
    });

    const review = await prisma.review.create({
      data: {
        projectId,
        projectVersionId: version.id,
        reviewerId: i % 2 === 0 ? trusted : reviewer,
        status: "SUBMITTED",
        confidenceLevel: i % 3 === 0 ? ConfidenceLevel.HIGH : ConfidenceLevel.MEDIUM,
        whatWorks: "Clear product direction and practical workflow framing.",
        whatIsWeak: "Some launch-critical workflows still require manual fallback.",
        whatIsUnclear: "Evidence of repeat retention could be better documented.",
        highestPriorityImprovement:
          "Tighten onboarding for first-time evaluators and improve docs discoverability.",
        weightedScore: 7.2 + (i % 3) * 0.5,
      },
    });

    for (const [idx, dimension] of dimensionList.entries()) {
      await prisma.reviewDimensionScore.create({
        data: {
          reviewId: review.id,
          dimension,
          score: 6 + ((idx + i) % 4),
          rationale: "Evidence supports current score; improvements are feasible in next cycle.",
        },
      });
    }
  }
}

async function seedGamification(users: Record<string, string>, projects: Record<string, string>) {
  const badges = await Promise.all([
    prisma.badge.create({
      data: {
        key: "quality_signal",
        label: "Quality Signal",
        description: "Consistently high quality review signal",
        type: BadgeType.QUALITY,
      },
    }),
    prisma.badge.create({
      data: {
        key: "fastest_improver",
        label: "Fastest Improver",
        description: "Strong improvement velocity across versions",
        type: BadgeType.IMPROVER,
      },
    }),
    prisma.badge.create({
      data: {
        key: "trusted_voice",
        label: "Trusted Voice",
        description: "Reliable and useful reviewer over time",
        type: BadgeType.TRUST,
      },
    }),
  ]);

  await prisma.userBadge.createMany({
    data: [
      { userId: users["trusted@4founders.dev"], badgeId: badges[0].id },
      { userId: users["founder@4founders.dev"], badgeId: badges[1].id },
      { userId: users["reviewer@4founders.dev"], badgeId: badges[2].id },
    ],
  });

  const voteUserIds = [
    users["reviewer@4founders.dev"],
    users["trusted@4founders.dev"],
    users["expert@4founders.dev"],
  ];

  for (const projectId of Object.values(projects)) {
    for (const voterId of voteUserIds) {
      await prisma.vote.create({
        data: {
          projectId,
          userId: voterId,
          type: VoteType.CONFIDENCE,
          value: 7,
          confidence: 8,
        },
      });
    }
  }
}

async function seedAccessModerationAndExpert(users: Record<string, string>, projects: Record<string, string>) {
  const adminId = users["admin@4founders.dev"];
  const expertId = users["expert@4founders.dev"];
  const founderId = users["founder@4founders.dev"];

  const launchCandidateProject = projects["shiplens"];

  await prisma.accessLog.createMany({
    data: [
      {
        projectId: launchCandidateProject,
        actorId: users["trusted@4founders.dev"],
        action: "review.open_project",
        metadata: JSON.stringify({ visibility: "LIMITED" }),
      },
      {
        projectId: launchCandidateProject,
        actorId: users["expert@4founders.dev"],
        action: "expert.open_protected_asset",
        metadata: JSON.stringify({ assetLabel: "System design" }),
      },
    ],
  });

  await prisma.moderationCase.create({
    data: {
      projectId: projects["promptgrid"],
      reporterId: users["reviewer@4founders.dev"],
      assignedAdminId: adminId,
      status: ModerationStatus.INVESTIGATING,
      reason: "Potentially copied positioning language detected in submission notes.",
    },
  });

  const supportRequest = await prisma.expertSupportRequest.create({
    data: {
      projectId: launchCandidateProject,
      founderId,
      status: SupportRequestStatus.APPROVED,
      requestNote: "Need final launch readiness validation and blocker guidance.",
      founderDisclosure: "Can disclose architecture and deployment notes to assigned expert.",
    },
  });

  await prisma.launchReadinessAssessment.create({
    data: {
      projectId: launchCandidateProject,
      expertId,
      supportRequestId: supportRequest.id,
      blockers: "Need stronger reliability runbook and incident ownership protocol.",
      fixes: "Finalize runbook and complete reliability drill before public launch.",
      recommendation: LaunchRecommendation.READY_WITH_FIXES,
      founderFollowUp: "Founder accepted fixes and requested one more verification pass.",
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: founderId,
        type: NotificationType.REVIEW_SUBMITTED,
        title: "New review received",
        body: "ShipLens received a high-confidence review with launch recommendations.",
      },
      {
        userId: adminId,
        type: NotificationType.MODERATION_ALERT,
        title: "Moderation case needs review",
        body: "A new copy-risk report was filed for PromptGrid.",
      },
      {
        userId: expertId,
        type: NotificationType.EXPERT_UPDATE,
        title: "Expert request approved",
        body: "You were assigned to ShipLens finalization workflow.",
      },
    ],
  });
}

async function seedReputation(users: Record<string, string>) {
  await prisma.reputationEvent.createMany({
    data: [
      {
        userId: users["reviewer@4founders.dev"],
        delta: 8,
        reason: "Submitted high-quality structured reviews",
      },
      {
        userId: users["trusted@4founders.dev"],
        delta: 14,
        reason: "Consistent high-usefulness feedback from founders",
      },
      {
        userId: users["founder@4founders.dev"],
        delta: 6,
        reason: "Strong improvement responsiveness across versions",
      },
    ],
  });
}

async function main() {
  await resetDatabase();
  await seedRoles();
  const users = await seedUsers();
  const categories = await seedCategories();
  const projects = await seedProjects(users, categories);
  await seedReviews(users, projects);
  await seedGamification(users, projects);
  await seedAccessModerationAndExpert(users, projects);
  await seedReputation(users);

  console.log("Seed complete.");
  console.log("Demo password for all accounts: Demo123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
