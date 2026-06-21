import { test, expect } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL;

const describeIf = baseURL ? test.describe : test.describe.skip;

describeIf("Authentication flows", () => {
  test("login screen renders", async ({ page }) => {
    await page.goto(baseURL!);
    await expect(page.getByPlaceholder("role@fleetflow.test")).toBeVisible();
    await expect(page.getByRole("button", { name: /continue with supabase/i })).toBeVisible();
  });

  test("logout is guarded", async () => {
    test.skip(true, "Requires a logged-in session and Supabase backend to test logout flow");
  });

  test("session persistence stub", async () => {
    test.skip(true, "Requires Supabase session fixture to test persistence");
  });
});
