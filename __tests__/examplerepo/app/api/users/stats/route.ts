import { NextRequest, NextResponse } from "next/server";
import { withInstrumentation } from "livedebugger";

async function getData(_query: string, _params: any[]) {
  const query = `
    SELECT TOP 100
      c.FirstName,
      c.LastName,
      c.Email,
      o.OrderID,
      p.ProductName,
      o.Quantity,
      o.OrderDate,
      DATEDIFF(DAY, o.OrderDate, GETDATE()) AS DaysSinceOrder
    FROM dbo.Orders o
    INNER JOIN dbo.Customers c ON o.CustomerID = c.CustomerID
    INNER JOIN dbo.Products p ON o.ProductID = p.ProductID
    WHERE 
      o.OrderDate >= '2024-01-01' AND o.OrderDate < '2025-01-01' -- No YEAR() anymore
      AND p.ProductName LIKE 'Pro%' -- No leading %
      AND c.Country IN ('Australia', 'United States', 'Canada', 'Germany', 'France')
    ORDER BY 
      c.LastName ASC, 
      o.OrderDate DESC
    OPTION (MAXDOP 1);
  `;

  // const result = (await pool.request().query(query)).recordset;

  return [];
}

async function getUserStatistics(userId?: number) {
  return [];
  //return await getData("", []);
}

export const GET = withInstrumentation(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') ? parseInt(searchParams.get('userId')!) : undefined;
    const result = await getUserStatistics(userId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error executing query:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}); 