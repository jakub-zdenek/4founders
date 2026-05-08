import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserContext } from "@/lib/api-auth";
import { z } from "zod";

const disclosureSchema = z.object({
  projectId: z.string().cuid(),
  requestedLevel: z.enum(["PUBLIC", "LIMITED", "PROTECTED", "EXPERT_ONLY"]),
  notes: z.string().max(1000).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { user } = await getCurrentUserContext();
    const payload = disclosureSchema.parse(await request.json());

    const entry = await prisma.disclosureRequest.create({
      data: {
        projectId: payload.projectId,
        requesterId: user.id,
        requestedLevel: payload.requestedLevel,
        notes: payload.notes,
      },
    });

    return NextResponse.json({ request: entry }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
