import { it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Navbar from "../components/Navbar/Navbar.jsx";
it("navegación BOGOBIKER adaptada: el menú distingue las cinco tareas", () => {
  const go = vi.fn();
  render(<Navbar page="inicio" onNavigate={go} />);
  fireEvent.click(screen.getByRole("button", { name: /Afiliados/ }));
  for (const name of [
    "Mi afiliación",
    "Mis citas",
    "Mis documentos",
    "Mis avisos",
    "Te escuchamos",
  ])
    expect(screen.getByText(name)).toBeInTheDocument();
  fireEvent.click(screen.getByText("Mis citas"));
  expect(go).toHaveBeenCalledWith("citas");
});
it("Escape cierra el menú y mantiene aria-expanded", () => {
  render(<Navbar page="inicio" onNavigate={vi.fn()} />);
  const button = screen.getByRole("button", { name: /Afiliados/ });
  fireEvent.click(button);
  expect(button).toHaveAttribute("aria-expanded", "true");
  fireEvent.keyDown(document, { key: "Escape" });
  expect(button).toHaveAttribute("aria-expanded", "false");
});
