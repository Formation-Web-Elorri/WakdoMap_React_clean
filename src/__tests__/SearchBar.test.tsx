import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { SearchBar } from "../components/Search/SearchBar";

describe("SearchBar", () => {
  it("émet onSearch au submit avec la valeur saisie", async () => {
    const onSearch = vi.fn();
    render(<SearchBar suggestions={[]} onSearch={onSearch} onSelect={vi.fn()} />);
    const input = screen.getByLabelText("Rechercher un restaurant");
    await userEvent.type(input, "Saint Etienne");
    await userEvent.click(screen.getByRole("button", { name: "Rechercher" }));
    expect(onSearch).toHaveBeenCalledWith("Saint Etienne");
  });

  it("n'affiche pas de suggestions quand la liste est vide", () => {
    render(<SearchBar suggestions={[]} onSearch={vi.fn()} onSelect={vi.fn()} />);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
