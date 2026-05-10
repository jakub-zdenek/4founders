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
          specialty: "Founder mentorship and launch guidance",
          yearsExperience: 10,
        },
      };
    }

    if (payload.intent === "participant") {
      data.reviewerProfile = {
        create: {
          trustScore: 0,
          reputationScore: 0,
          reviewCount: 0,
        },
      };
    }

    if (payload.intent === "founder") {
      data.founderProfile = {
        create: {
          tagline: "Building a new idea on 4Founders",
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
