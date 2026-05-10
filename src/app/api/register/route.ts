import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Prisma, RoleType } from "@prisma/client";

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  intent: z.enum(["founder", "mentor", "participant"]).default("founder"),
  founderMotivation: z.string().max(1500).optional(),
  supportApproach: z.string().max(1500).optional(),
  supportAreas: z.string().max(800).optional(),
  githubUrl: z.string().url().optional().or(z.literal("")),
  credibilityStatement: z.string().max(1500).optional(),
  passionStatement: z.string().max(1500).optional(),
}).superRefine((value, ctx) => {
  if (value.intent === "founder" && !value.founderMotivation?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Founder motivation is required",
      path: ["founderMotivation"],
    });
  }

  if (value.intent === "mentor" && !value.credibilityStatement?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Credibility statement is required",
      path: ["credibilityStatement"],
    });
  }

  if ((value.intent === "mentor" || value.intent === "participant") && !value.supportApproach?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Support approach is required",
      path: ["supportApproach"],
    });
  }

  if ((value.intent === "mentor" || value.intent === "participant") && !value.supportAreas?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Support areas are required",
      path: ["supportAreas"],
    });
  }

  if ((value.intent === "mentor" || value.intent === "participant") && !value.passionStatement?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Passion statement is required",
      path: ["passionStatement"],
    });
  }
});

const intentConfig = {
  founder: {
    role: RoleType.FOUNDER,
    redirectPath: "/app/projects/new",
  },
  mentor: {
    role: RoleType.SENIOR_EXPERT,
    redirectPath: "/app/expert",
  },
  participant: {
    role: RoleType.REVIEWER,
    redirectPath: "/app/reviews",
  },
} as const;

export async function POST(request: NextRequest) {
  try {
    const payload = registerSchema.parse(await request.json());

    const existing = await prisma.user.findUnique({ where: { email: payload.email } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);
    const selected = intentConfig[payload.intent];

    const role = await prisma.role.upsert({
      where: { type: selected.role },
      update: {},
      create: { type: selected.role },
    });

    const data: Prisma.UserCreateInput = {
      name: payload.name,
      email: payload.email,
      passwordHash,
      userRoles: {
        create: {
          role: {
            connect: {
              id: role.id,
            },
          },
        },
      },
    };

    if (payload.intent === "mentor") {
      data.expertProfile = {
        create: {
          specialty: payload.supportAreas || "Founder mentorship and launch guidance",
          yearsExperience: 10,
          credibilityStatement: payload.credibilityStatement || null,
          supportApproach: payload.supportApproach || null,
          supportAreas: payload.supportAreas || null,
          githubUrl: payload.githubUrl || null,
          passionStatement: payload.passionStatement || null,
        },
      };
    }

    if (payload.intent === "participant") {
      data.reviewerProfile = {
        create: {
          trustScore: 0,
          reputationScore: 0,
          reviewCount: 0,
          supportApproach: payload.supportApproach || null,
          supportAreas: payload.supportAreas || null,
          githubUrl: payload.githubUrl || null,
          passionStatement: payload.passionStatement || null,
        },
      };
    }

    if (payload.intent === "founder") {
      data.founderProfile = {
        create: {
          tagline: "Building a new idea on 4Founders",
          motivation: payload.founderMotivation || null,
        },
      };
    }

    const user = await prisma.user.create({
      data,
    });

    return NextResponse.json({ id: user.id, redirectPath: selected.redirectPath }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid registration payload" }, { status: 400 });
  }
}
