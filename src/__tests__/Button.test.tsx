import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Button } from "../components/Overlay/Button";

describe("Button", () => {
  it("affiche son label", () => {
    render(<Button>Continuer</Button>);
    expect(screen.getByRole("button", { name: "Continuer" })).toBeInTheDocument();
  });

  it("appelle onClick au clic", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>ok</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
