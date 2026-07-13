import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Overlay } from "../components/Overlay/Overlay";

describe("Overlay", () => {
  it("affiche l'état vide par défaut", () => {
    render(<Overlay restaurant={null} onContinue={vi.fn()} />);
    expect(screen.getByText(/Aucun restaurant/i)).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("affiche l'adresse et le bouton Continuer quand un restaurant est sélectionné", () => {
    render(
      <Overlay
        restaurant={{ id: 1, name: "McDo", address: "Place Lucien Neuwirth", lat: 0, lon: 0 }}
        onContinue={vi.fn()}
      />,
    );
    expect(screen.getByText("Place Lucien Neuwirth")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continuer" })).toBeInTheDocument();
  });
});
