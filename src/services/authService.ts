import { supabase } from "../lib/supabaseClient";

export async function loginWithPassword(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw error;
  }
  return true;
}

export async function logoutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
  return true;
}

export async function fetchCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw error;
  }
  return data?.session ?? null;
}
