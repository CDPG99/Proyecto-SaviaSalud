import { it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Informacion from "../pages/Informacion.jsx";
import Portal from "../pages/Portal.jsx";
it("medicamentos tiene una lista interactiva con progreso", () => {
  render(<Informacion kind="medicamentos" onNavigate={vi.fn()} />);
  for (const checkbox of screen.getAllByRole("checkbox"))
    fireEvent.click(checkbox);
  expect(screen.getByText("Ya organizaste tu consulta.")).toBeInTheDocument();
});
it("domiciliaria guía una consulta sin dar elegibilidad clínica", () => {
  render(<Informacion kind="domiciliaria" onNavigate={vi.fn()} />);
  fireEvent.click(
    screen.getByText("¿Quieres información general sobre atención en casa?"),
  );
  expect(
    screen.getByRole("heading", { name: "Información general" }),
  ).toBeInTheDocument();
  expect(
    screen.getByText(/no determina si una persona es elegible/),
  ).toBeInTheDocument();
});
it("preguntas frecuentes permiten buscar y filtrar", () => {
  render(<Informacion kind="ayuda" onNavigate={vi.fn()} />);
  fireEvent.change(screen.getByLabelText("Buscar una pregunta"), {
    target: { value: "certificado" },
  });
  expect(
    screen.getByText("¿Dónde descargo mi certificado?"),
  ).toBeInTheDocument();
  expect(
    screen.queryByText("¿Cómo ingreso a mi espacio personal?"),
  ).not.toBeInTheDocument();
});
it("acompañamiento cambia de enfoque según la persona", () => {
  render(<Informacion kind="orientacion" onNavigate={vi.fn()} />);
  fireEvent.click(
    screen.getByRole("button", { name: "Estoy acompañando a alguien" }),
  );
  expect(
    screen.getByRole("heading", {
      name: "Escuchar también es una forma de acompañar.",
    }),
  ).toBeInTheDocument();
});
it("el portal público no muestra personas ni botones administrativos", () => {
  render(<Portal onNavigate={vi.fn()} />);
  expect(screen.queryByRole("table")).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: /eliminar afiliado|editar usuario/i }),
  ).not.toBeInTheDocument();
  expect(screen.getByText("Ingresar al portal →")).toBeInTheDocument();
});
