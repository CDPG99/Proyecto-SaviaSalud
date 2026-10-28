import { it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Acceso from "../pages/Acceso.jsx";
it("formulario BOGOBIKER adaptado: valida el acceso vacío", () => {
  render(<Acceso onNavigate={vi.fn()} onLogin={vi.fn()} />);
  fireEvent.click(
    screen.getByRole("button", { name: "Ingresar", exact: true }),
  );
  expect(screen.getByRole("alert")).toHaveTextContent(
    "El correo y la contraseña son obligatorios.",
  );
});
it("permite usar datos de ejemplo sin abrir una sesión automáticamente", () => {
  const login = vi.fn();
  render(<Acceso onNavigate={vi.fn()} onLogin={login} />);
  fireEvent.click(
    screen.getByText("¿Quieres explorar con una cuenta de ejemplo?"),
  );
  fireEvent.click(screen.getByRole("button", { name: "Usar estos datos" }));
  expect(screen.getByLabelText("Correo electrónico")).toHaveValue(
    "demo@virelia.test",
  );
  expect(login).not.toHaveBeenCalled();
});
