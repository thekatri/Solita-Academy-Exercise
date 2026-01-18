import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function longestNegativeStreak(prices: number[]): number {
  let maxStreak = 0;
  let currentStreak = 0;

  for (const price of prices) {
    currentStreak = price < 0 ? currentStreak + 1 : 0;
    maxStreak = Math.max(maxStreak, currentStreak);
  }

  return maxStreak;
}

export async function GET() {
  try {
    const allAggregates = await prisma.electricitydata.groupBy({
      by: ["date"],
      _sum: {
        productionamount: true,
        consumptionamount: true,
      },
      _avg: {
        hourlyprice: true,
      },
    });

    const allDates: Date[] = allAggregates
      .map((d) => d.date)
      .filter((d): d is Date => d !== null);

    if (allDates.length === 0) {
      return NextResponse.json({ data: [], totalRecords: 0 });
    }

    const hourlyPrices = await prisma.electricitydata.findMany({
      where: { date: { in: allDates } },
      select: { date: true, hourlyprice: true },
    });

    const pricesByDate = new Map<string, number[]>();

    hourlyPrices.forEach((row) => {
      if (!row.date) return;
      const dateKey = row.date.toISOString().split("T")[0];
      if (!pricesByDate.has(dateKey)) {
        pricesByDate.set(dateKey, []);
      }
      pricesByDate.get(dateKey)!.push(Number(row.hourlyprice));
    });

    const data = allAggregates
      .map((agg) => {
        if (!agg.date) return null;
        const dateKey = agg.date.toISOString().split("T")[0];
        return {
          date: dateKey,
          totalProduction: Number(agg._sum.productionamount ?? 0),
          totalConsumption: Number(agg._sum.consumptionamount ?? 0),
          avgPrice: Number(agg._avg.hourlyprice ?? 0),
          longestNegativeHours: longestNegativeStreak(
            pricesByDate.get(dateKey) || [],
          ),
        };
      })
      .filter(Boolean);

    return NextResponse.json({ data, totalRecords: data.length });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
