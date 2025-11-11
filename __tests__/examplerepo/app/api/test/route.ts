import { NextResponse } from "next/server";
import { withInstrumentation } from "livedebugger";

export const GET = withInstrumentation(async (_request: Request) => {
  const testData = {
    message: "Hello from the test API!",
    timestamp: new Date().toISOString(),
    data: {
      items: [
        { id: 1, name: "Item 1" },
        { id: 2, name: "Item 2" },
        { id: 3, name: "Item 3" },
      ],
    },
  };

  return NextResponse.json(testData);
});