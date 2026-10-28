import { it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import Navbar from "../components/Navbar/Navbar.jsx";
import Layout from "../components/Layout/Layout.jsx";
import Inicio from "../pages/Inicio.jsx";
it("estructura BOGOBIKER adaptada: nav, main y section semánticos", () => {
  const { container } = render(
    <>
      <Navbar onNavigate={vi.fn()} />
      <Layout>
        <Inicio onNavigate={vi.fn()} />
      </Layout>
    </>,
  );
  for (const selector of ["nav", "main", "section"])
    expect(container.querySelector(selector)).toBeInTheDocument();
});
