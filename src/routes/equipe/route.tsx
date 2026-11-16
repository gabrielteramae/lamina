import { createFileRoute } from "@tanstack/react-router";
import { EquipeFrame } from "@/components/equipe/frame";

export const Route = createFileRoute("/equipe")({
  component: EquipeFrame,
});
