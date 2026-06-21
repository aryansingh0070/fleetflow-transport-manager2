import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";
import { fetchFleetSnapshot, type FleetSnapshot } from "../services/fleetService";
import { loginWithPassword, logoutUser, fetchCurrentSession } from "../services/authService";
import { captureException } from "../lib/sentry";
import type { Driver, Expense, FleetRole, FleetUser, Trip, Vehicle } from "../types";

const defaultStatus = "Syncing with Supabase";

export type FleetSessionState = {
  session: Session | null;
  currentUser: FleetUser | null;
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  expenses: Expense[];
  authLoading: boolean;
  dataLoading: boolean;
  statusMessage: string | null;
  errorMessage: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

export const useFleetSession = (): FleetSessionState => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<FleetUser | null>(null);
  const [snapshot, setSnapshot] = useState<FleetSnapshot | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetData = useCallback(() => {
    setSnapshot(null);
    setCurrentUser(null);
  }, []);

  const loadProfile = useCallback(async (userId: string) => {
    setStatusMessage("Loading user profile");
    setErrorMessage(null);

    try {
      const { data, error } = await supabase
        .from("users")
        .select("id,email,full_name,organization,role,created_at")
        .eq("id", userId)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("User profile is missing.");
      }

      const safeRole = (data.role ?? "owner") as FleetRole;
      setCurrentUser({ ...data, role: safeRole });
      setStatusMessage("Profile synchronized");
    } catch (error) {
      captureException(error, { phase: "loadProfile" });
      resetData();
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Unable to load profile.");
      }
    }
  }, [resetData]);

  const refreshSnapshot = useCallback(async () => {
    setDataLoading(true);
    setStatusMessage(defaultStatus);
    setErrorMessage(null);

    try {
      const data = await fetchFleetSnapshot();
      setSnapshot(data);
      setStatusMessage("Fleet data refreshed");
    } catch (error) {
      captureException(error, { phase: "refreshSnapshot" });
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Unable to load fleet data.");
      }
    } finally {
      setDataLoading(false);
    }
  }, []);

  const handleLogin = useCallback(async (email: string, password: string) => {
    setAuthLoading(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      await loginWithPassword(email, password);
      setStatusMessage("Signed in successfully.");
    } catch (error) {
      captureException(error, { phase: "login" });
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Unable to sign in.");
      }
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    setAuthLoading(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      await logoutUser();
    } catch (error) {
      captureException(error, { phase: "logout" });
      if (error instanceof Error) {
        setErrorMessage(error.message);
      }
    } finally {
      resetData();
      setSession(null);
      setSnapshot(null);
      setAuthLoading(false);
      setStatusMessage("Logged out");
    }
  }, [resetData]);

  useEffect(() => {
    fetchCurrentSession().then((sessionData) => {
      setSession(sessionData);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (!nextSession) {
        resetData();
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user?.id) {
      return;
    }

    loadProfile(session.user.id);
  }, [session, loadProfile]);

  useEffect(() => {
    if (currentUser) {
      refreshSnapshot();
    }
  }, [currentUser, refreshSnapshot]);

  const vehicles = snapshot?.vehicles ?? [];
  const trips = snapshot?.trips ?? [];
  const drivers = snapshot?.drivers ?? [];
  const expenses = snapshot?.expenses ?? [];

  return {
    session,
    currentUser,
    vehicles,
    drivers,
    trips,
    expenses,
    authLoading,
    dataLoading,
    statusMessage,
    errorMessage,
    login: handleLogin,
    logout: handleLogout,
    refresh: refreshSnapshot,
  };
};
