import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import App from "../App";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Wacdo — Trouver un restaurant" },
      {
        name: "description",
        content:
          "Recherchez un restaurant McDonald's dans une ville et sélectionnez-le sur la carte.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <App />;
}
