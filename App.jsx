import { useState, useEffect } from "react";
import { api, send } from "./services/api.js";
import Navbar from "./components/Navbar/Navbar.jsx";
import Layout from "./components/Layout/Layout.jsx";
import Footer from "./components/Footer/Footer.jsx";
import { Link, Icon, Alert } from "./components/ui.jsx";
import Inicio from "./pages/Inicio.jsx";
import Portal from "./pages/Portal.jsx";
import Acceso from "./pages/Acceso.jsx";
import Perfil from "./pages/Perfil.jsx";
import Citas from "./pages/Citas.jsx";
import Documentos from "./pages/Documentos.jsx";
import Notificaciones from "./pages/Notificaciones.jsx";
import Atencion from "./pages/Atencion.jsx";
import Informacion from "./pages/Informacion.jsx";
import Nosotros from "./pages/Nosotros.jsx";
const aliases = {
  "afiliados/medicamentos": "medicamentos",
  "afiliados/medicina-domiciliaria": "domiciliaria",
  "afiliados/muerte-digna": "orientacion",
  "afiliados/preguntas-frecuentes": "ayuda",
};
function current() {
  let p = window.location.hash.replace(/^#\/?/, "") || "inicio";
  return aliases[p] || (p.startsWith("nosotros/") ? "nosotros" : p);
}
const privateRoutes = [
  "perfil",
  "citas",
  "documentos",
  "notificaciones",
  "atencion",
];
export default function App() {
  const [page, setPage] = useState(current),
    [user, setUser] = useState(null),
    [checking, setChecking] = useState(true),
    [returnTo, setReturnTo] = useState(() =>
      privateRoutes.includes(current()) ? current() : "afiliados",
    ),
    [sessionError, setSessionError] = useState("");
  useEffect(() => {
    const change = () => setPage(current());
    window.addEventListener("hashchange", change);
    api("afiliados", "/me")
      .then(setUser)
      .catch((e) => {
        if (e.status !== 401)
          setSessionError(
            "El acceso personal no está disponible en este momento. Puedes consultar la información pública.",
          );
      })
      .finally(() => setChecking(false));
    return () => window.removeEventListener("hashchange", change);
  }, []);
  useEffect(() => {
    document.title = `${page === "inicio" ? "Tu salud, contigo" : page.charAt(0).toUpperCase() + page.slice(1)} · Virelia`;
    window.scrollTo(0, 0);
  }, [page]);
  function navigate(next) {
    if (privateRoutes.includes(next) && !user) setReturnTo(next);
    setPage(next);
    window.location.hash = `/${next}`;
  }
  function login(u) {
    setUser(u);
    setSessionError("");
    navigate(returnTo);
  }
  async function logout() {
    try {
      await api("afiliados", "/logout", { method: "POST", body: send({}) });
      setUser(null);
      navigate("inicio");
    } catch (e) {
      setSessionError(e.message);
    }
  }
  const personal = Boolean(
    user && (privateRoutes.includes(page) || page === "afiliados"),
  );
  let content;
  if (checking && (privateRoutes.includes(page) || page === "afiliados"))
    content = (
      <div className="container loading" role="status">
        Abriendo tu portal…
      </div>
    );
  else if (privateRoutes.includes(page) && !user)
    content = <Acceso onNavigate={navigate} onLogin={login} />;
  else
    switch (page) {
      case "inicio":
        content = <Inicio onNavigate={navigate} />;
        break;
      case "afiliados":
        content = <Portal user={user} onNavigate={navigate} />;
        break;
      case "login":
      case "registro":
        content = (
          <Acceso
            register={page === "registro"}
            key={page}
            onNavigate={navigate}
            onLogin={login}
          />
        );
        break;
      case "perfil":
        content = <Perfil user={user} onUser={setUser} />;
        break;
      case "citas":
        content = <Citas />;
        break;
      case "documentos":
        content = <Documentos />;
        break;
      case "notificaciones":
        content = <Notificaciones onNavigate={navigate} />;
        break;
      case "atencion":
        content = <Atencion />;
        break;
      case "medicamentos":
      case "domiciliaria":
      case "orientacion":
      case "ayuda":
        content = <Informacion key={page} kind={page} onNavigate={navigate} />;
        break;
      case "nosotros":
        content = <Nosotros onNavigate={navigate} />;
        break;
      default:
        content = (
          <section className="container empty">
            <Icon name="search" size={40} />
            <h1>No encontramos esa página.</h1>
            <Link to="inicio" onNavigate={navigate} className="button">
              Volver al inicio
            </Link>
          </section>
        );
    }
  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <Navbar page={page} user={user} onNavigate={navigate} onLogout={logout} />
      {sessionError && (
        <div className="container">
          <Alert>{sessionError}</Alert>
        </div>
      )}
      <Layout
        privatePage={personal}
        user={user}
        page={page}
        onNavigate={navigate}
      >
        {content}
      </Layout>
      <Footer onNavigate={navigate} />
    </>
  );
}
