import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(async () => ({ userId: "user_test_admin" })),
}));

const { dbState } = vi.hoisted(() => ({
  dbState: { rows: [] as { state: string; fee: number; active: boolean }[] },
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        order: () => Promise.resolve({ data: dbState.rows, error: null }),
      }),
      update: (patch: Record<string, unknown>) => ({
        eq: (_col: string, value: string) => ({
          select: () => ({
            single: () => {
              const row = dbState.rows.find((r) => r.state === value);
              if (!row) return Promise.resolve({ data: null, error: { message: "not found" } });
              Object.assign(row, patch);
              return Promise.resolve({ data: row, error: null });
            },
          }),
        }),
      }),
    }),
  },
}));

function putRequest(body: unknown) {
  return new Request("http://localhost/api/admin/delivery-rates", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("PUT /api/admin/delivery-rates", () => {
  beforeEach(() => {
    process.env.ADMIN_USER_IDS = "user_test_admin";
    dbState.rows = [
      { state: "FCT (Abuja)", fee: 0, active: false },
      { state: "Kano", fee: 0, active: false },
    ];
  });

  it("updates the fee and active flag for a known state", async () => {
    const { PUT } = await import("@/app/api/admin/delivery-rates/route");
    const res = await PUT(putRequest({ state: "FCT (Abuja)", fee: 1500, active: true }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.fee).toBe(1500);
    expect(body.active).toBe(true);
  });

  it("rejects a state outside the seeded list", async () => {
    const { PUT } = await import("@/app/api/admin/delivery-rates/route");
    const res = await PUT(putRequest({ state: "Neverland", fee: 1000, active: true }));
    expect(res.status).toBe(400);
  });

  it("rejects a negative fee", async () => {
    const { PUT } = await import("@/app/api/admin/delivery-rates/route");
    const res = await PUT(putRequest({ state: "Kano", fee: -50, active: true }));
    expect(res.status).toBe(400);
  });

  it("rejects a request from a signed-in user who is not on the admin allowlist", async () => {
    process.env.ADMIN_USER_IDS = "someone_else";
    const { PUT } = await import("@/app/api/admin/delivery-rates/route");
    const res = await PUT(putRequest({ state: "Kano", fee: 1000, active: true }));
    expect(res.status).toBe(403);
  });
});
