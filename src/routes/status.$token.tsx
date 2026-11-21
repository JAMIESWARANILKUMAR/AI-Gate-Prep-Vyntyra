import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/status/$token")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/verify", search: { id: params.token } });
  },
  component: () => null,
});
