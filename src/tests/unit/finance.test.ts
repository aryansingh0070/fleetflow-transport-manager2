import { describe, it, expect } from "vitest";
import { calculateTotalRevenue, calculateTotalExpenses, calculateProfit } from "../../utils/finance";

describe("finance helpers", () => {
  it("calculates revenue from trips", () => {
    const trips = [
      { revenue: 100 } as any,
      { revenue: 250 } as any,
    ];
    expect(calculateTotalRevenue(trips as any)).toBe(350);
  });

  it("calculates expenses", () => {
    const expenses = [
      { amount: 40 } as any,
      { amount: 60 } as any,
    ];
    expect(calculateTotalExpenses(expenses as any)).toBe(100);
  });

  it("calculates profit from trips and expenses", () => {
    const trips = [{ revenue: 200 } as any];
    const expenses = [{ amount: 50 } as any];
    expect(calculateProfit(trips as any, expenses as any)).toBe(150);
  });
});
