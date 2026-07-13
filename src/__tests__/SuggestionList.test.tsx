import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { SuggestionList } from "../components/Search/SuggestionList";
import type { City } from "../types";

const cities: City[] = [
  { id: 1, name: "Saint-Étienne", displayName: "Saint-Étienne, Loire", lat: 0, lon: 0, bbox: [0, 0, 0, 0] },
  { id: 2, name: "Saint-Étienne-du-Rouvray", displayName: "Saint-Étienne-du-Rouvray", lat: 0, lon: 0, bbox: [0, 0, 0, 0] },
];

describe("SuggestionList", () => {
  it("rend chaque suggestion", () => {
    render(<SuggestionList items={cities} onSelect={vi.fn()} />);
    expect(screen.getAllByRole("option")).toHaveLength(2);
  });

  it("appelle onSelect au clic", async () => {
    const onSelect = vi.fn();
    render(<SuggestionList items={cities} onSelect={onSelect} />);
    await userEvent.click(screen.getByText("Saint-Étienne-du-Rouvray"));
    expect(onSelect).toHaveBeenCalledWith(cities[1]);
  });
});
