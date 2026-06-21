import type { FleetRole, RolePlaybookConfig } from "../types";

type RolePlaybook = RolePlaybookConfig;

export const rolePlaybooks: Record<FleetRole, RolePlaybook> = {
  owner: {
    title: "Owner oversight",
    description: "Set strategic direction, validate reports, and approve budgets across fleets.",
    actions: [
      "Review revenue vs. expenses every reporting cycle",
      "Approve new driver and vehicle onboarding",
      "Set long-term maintenance and safety guardrails",
    ],
  },
  accountant: {
    title: "Accounting trust",
    description: "Keep cash flow in the green and ensure every expense is tied to a trip.",
    actions: [
      "Reconcile trip revenue with invoices",
      "Audit expenses and flag overruns",
      "Prepare timely reports for leadership",
    ],
  },
  dispatcher: {
    title: "Dispatch control",
    description: "Balance road coverage, coordinate drivers, and surface issues proactively.",
    actions: [
      "Assign drivers to trips based on availability",
      "Monitor vehicle status and readiness",
      "Respond to trip delays or incidents",
    ],
  },
  driver: {
    title: "Driver operations",
    description: "Stay focused on safe trip execution while documenting delivery details.",
    actions: [
      "Update trip status and mileage",
      "Log expenses as they occur",
      "Share feedback on route performance",
    ],
  },
};
