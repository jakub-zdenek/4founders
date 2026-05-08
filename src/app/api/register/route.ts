import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { RoleType } from "@prisma/client";

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export async function POST(request: NextRequest) {
  try {
    const payload = registerSchema.parse(await request.json());

    const existing = await prisma.user.findUnique({ where: { email: payload.email } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);

    const founderRole = await prisma.role.upsert({
      where: { type: RoleType.FOUNDER },
      update: {},
      create: { type: RoleType.FOUNDER },
    });

    const user = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        passwordHash,
        userRoles: {
          create: {
            roleId: founderRole.id,
          },
        },
        founderProfile: {
          create: {
            tagline: "New founder on 4Founders",
          },
        },
      },
    });

    return NextResponse.json({ id: user.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid registration payload" }, { status: 400 });
  }
}
