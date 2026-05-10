import { NextRequest, NextResponse } from "next/server";
import { ProjectStage } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUserContext } from "@/lib/api-auth";
import { hasAnyRole } from "@/lib/rbac";
import { projectCreateSchema } from "@/features/projects/project.schema";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function GET() {
  try {
    const { user, roles } = await getCurrentUserContext();

    const where = hasAnyRole(roles, ["ADMIN", "MODERATOR"]) ? {} : { ownerId: user.id };

    const projects = await prisma.project.findMany({
      where,
      include: {
        category: true,
        versions: { orderBy: { versionNumber: "desc" }, take: 1 },
        reviews: { select: { id: true, weightedScore: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ projects });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, roles } = await getCurrentUserContext();
    if (!hasAnyRole(roles, ["FOUNDER", "ADMIN"])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const payload = projectCreateSchema.parse(await request.json());
    const baseSlug = slugify(payload.name);

    let slug = baseSlug;
    let suffix = 1;
    while (await prisma.project.findUnique({ where: { slug } })) {
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }

    const project = await prisma.project.create({
      data: {
        ownerId: user.id,
        categoryId: payload.categoryId,
        name: payload.name,
        slug,
        valueProposition: payload.valueProposition,
        targetUser: payload.targetUser,
        productStage: payload.productStage,
        githubRepoUrl: payload.githubRepoUrl,
        websiteUrl: payload.websiteUrl || null,
        contactInfo: payload.contactInfo || null,
        privateTestCredentials: payload.privateTestCredentials || null,
        founderMotivation: payload.founderMotivation,
        problemStatement: payload.problemStatement,
        solutionApproach: payload.solutionApproach,
        differentiationStatement: payload.differentiationStatement,
        preferredFeedbackFocus: payload.preferredFeedbackFocus,
        presentationUrl: payload.presentationUrl || null,
        sharingPreference: payload.sharingPreference || null,
        supportNeeded: payload.supportNeeded || null,
        teamBuildingInterest: payload.teamBuildingInterest,
        teamNeeds: payload.teamNeeds || null,
        visibilityMode: payload.visibilityMode,
        stage: ProjectStage.UNDER_REVIEW,
        visibilityPolicy: {
          create: {
            defaultVisibility: payload.visibilityMode,
          },
        },
        versions: {
          create: {
            versionNumber: 1,
            changelog: "Initial submission",
            launchGoals: payload.launchGoals,
            knownWeaknesses: payload.knownWeaknesses,
            privateReviewerNotes: payload.privateReviewerNotes,
            waitlistLink: payload.waitlistLink || null,
          },
        },
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
