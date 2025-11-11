import { NextResponse } from "next/server";
import { withInstrumentation } from "livedebugger";

export const GET = withInstrumentation(async () => {
  return NextResponse.json({ status: "ok" });
}); 