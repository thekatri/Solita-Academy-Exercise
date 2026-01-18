import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ date: string }> },
) {
  try {
    const { date: dateString } = await params;

    const startDate = new Date(dateString);
    const endDate = new Date(dateString);
    endDate.setUTCHours(23, 59, 59, 999);

    const rawRows = await prisma.electricitydata.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        starttime: true,
        hourlyprice: true,
        productionamount: true,
        consumptionamount: true,
      },
      orderBy: {
        starttime: "asc",
      },
    });

    const hourlyData = rawRows.map((row) => ({
      starttime: row.starttime,
      hourlyprice: Number(row.hourlyprice),
      productionamount: Number(row.productionamount || 0),
      consumptionamount: Number(row.consumptionamount || 0),
    }));

    return NextResponse.json({ data: hourlyData });
  } catch (error) {
    console.error("Hourly API error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
