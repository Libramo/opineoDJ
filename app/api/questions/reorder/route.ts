import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { questions } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const schema = z.object({
  orderedIds: z.array(z.string().min(1)).min(1),
});

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ success: false }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: false }, { status: 400 });

  await Promise.all(
    parsed.data.orderedIds.map((id, i) =>
      db.update(questions).set({ order: i }).where(eq(questions.id, id))
    )
  );

  return NextResponse.json({ success: true });
}
