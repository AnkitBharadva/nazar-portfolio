import { NextResponse } from "next/server";
import { getSiteData } from "@/lib/store";

export const dynamic = "force-dynamic";

/** Public read endpoint for the whole site (profile, projects, achievements, experience). */
export async function GET() {
  try {
    const data = await getSiteData();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Could not load site data." }, { status: 500 });
  }
}
