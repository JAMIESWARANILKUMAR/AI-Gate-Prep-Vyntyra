import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/campus-ambassador")({
  beforeLoad: () => {
    throw redirect({ to: "/auth/intern" });
  },
  component: () => null,
});
