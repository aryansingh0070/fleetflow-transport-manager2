import { describe, it, expect, vi } from "vitest";
import { loginWithPassword, logoutUser, fetchCurrentSession } from "../../services/authService";
import { supabase } from "../../lib/supabaseClient";

vi.mock("../../lib/supabaseClient", () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: "user-id" } } }, error: null }),
    },
  },
}));

type MockedAuth = {
  signInWithPassword: ReturnType<typeof vi.fn>;
  signOut: ReturnType<typeof vi.fn>;
  getSession: ReturnType<typeof vi.fn>;
};

const mockedAuth = (supabase.auth as unknown) as MockedAuth;

describe("authService", () => {
  it("logs in when credentials are valid", async () => {
    await expect(loginWithPassword("test@example.com", "password")).resolves.toBe(true);
    expect(mockedAuth.signInWithPassword).toHaveBeenCalledOnce();
  });

  it("throws when sign in fails", async () => {
    mockedAuth.signInWithPassword.mockResolvedValueOnce({ error: new Error("invalid") });
    await expect(loginWithPassword("test@example.com", "wrong")).rejects.toThrow("invalid");
  });

  it("logs out successfully", async () => {
    await expect(logoutUser()).resolves.toBe(true);
    expect(mockedAuth.signOut).toHaveBeenCalledOnce();
  });

  it("fetches the current session", async () => {
    await expect(fetchCurrentSession()).resolves.toMatchObject({ user: { id: "user-id" } });
    expect(mockedAuth.getSession).toHaveBeenCalledOnce();
  });
});
