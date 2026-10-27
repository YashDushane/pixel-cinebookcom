import { describe, expect, it } from "vitest";
import { calcTotal, toggleSeat } from "./format";

describe("booking rules", () => {
  it("charges ₹200 per seat", () => {
    expect(calcTotal(3, 200)).toBe(600);
  });
  it("cannot select a booked seat", () => {
    expect(toggleSeat([], "C5", new Set(["C5"]))).toEqual([]);
  });
  it("deselects an already selected seat", () => {
    expect(toggleSeat(["A1", "A2"], "A1", new Set())).toEqual(["A2"]);
  });
  it("stops at the seat limit", () => {
    expect(toggleSeat(["A1", "A2"], "A3", new Set(), 2)).toEqual(["A1", "A2"]);
  });
});
