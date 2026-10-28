import { describe, expect, it } from "vitest";
import { quickAddChoice } from "@/lib/quickAdd";

const v = (id: string) => ({ id, label: id });

describe("quickAddChoice", () => {
  it("asks the shopper to choose when there is more than one size", () => {
    expect(quickAddChoice({ inStock: true, colors: [v("red")], sizes: [v("2-3y"), v("3-4y")] })).toEqual({ kind: "choose" });
  });

  it("asks the shopper to choose when there is more than one colour", () => {
    expect(quickAddChoice({ inStock: true, colors: [v("red"), v("blue")], sizes: [v("2-3y")] })).toEqual({ kind: "choose" });
  });

  it("adds directly when there is exactly one colour and one size", () => {
    expect(quickAddChoice({ inStock: true, colors: [v("red")], sizes: [v("2-3y")] })).toEqual({
      kind: "add",
      colorId: "red",
      sizeId: "2-3y",
    });
  });

  it("adds directly when the product has no variants", () => {
    expect(quickAddChoice({ inStock: true, colors: [], sizes: [] })).toEqual({
      kind: "add",
      colorId: undefined,
      sizeId: undefined,
    });
  });

  it("never adds an out-of-stock product, whatever its variants", () => {
    expect(quickAddChoice({ inStock: false, colors: [], sizes: [] })).toEqual({ kind: "unavailable" });
    expect(quickAddChoice({ inStock: false, colors: [v("a"), v("b")], sizes: [] })).toEqual({ kind: "unavailable" });
  });
});
