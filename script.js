// =========================================================
// VIRELIA HEALTH
// JavaScript para la navegación del apartado NOSOTROS
// =========================================================


// Obtener elementos del HTML
const nosotrosBtn = document.getElementById("nosotrosBtn");
const nosotrosMenu = document.getElementById("nosotrosMenu");


// Obtener todas las páginas
const pages = document.querySelectorAll(".page");


// Obtener botones del menú Nosotros
const menuButtons = document.querySelectorAll("#nosotrosMenu button");


// =========================================================
// ABRIR / CERRAR MENÚ NOSOTROS
// =========================================================

nosotrosBtn.addEventListener("click", function(event) {

  // Evita que el clic llegue al documento
  event.stopPropagation();

  // Mostrar u ocultar el menú
  nosotrosMenu.classList.toggle("show");

});


// =========================================================
// CAMBIAR DE SECCIÓN
// =========================================================

menuButtons.forEach(function(button) {

  button.addEventListener("click", function() {

    // Obtener el nombre de la sección
    const pageId = button.getAttribute("data-page");


    // Ocultar todas las páginas
    pages.forEach(function(page) {

      page.classList.add("hidden");

    });


    // Mostrar la página seleccionada
    const selectedPage = document.getElementById(pageId);

    if (selectedPage) {

      selectedPage.classList.remove("hidden");

      // Llevar al usuario al inicio del contenido
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    }


    // Cerrar el menú
    nosotrosMenu.classList.remove("show");

  });

});


// =========================================================
// CERRAR MENÚ AL HACER CLIC AFUERA
// =========================================================

document.addEventListener("click", function(event) {

  if (!event.target.closest(".nav-dropdown")) {

    nosotrosMenu.classList.remove("show");

  }

});


// =========================================================
// BOTÓN INICIO
// =========================================================

const inicioBtn = document.querySelector('[data-page="inicio"]');

inicioBtn.addEventListener("click", function() {

  // Ocultar todas las secciones
  pages.forEach(function(page) {

    page.classList.add("hidden");

  });


  // Mostrar inicio
  document.getElementById("inicio").classList.remove("hidden");

  // Cerrar menú
  nosotrosMenu.classList.remove("show");

  // Subir al comienzo
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

});


// =========================================================
// FORMULARIO TRABAJA CON NOSOTROS
// =========================================================

const careerForm = document.getElementById("careerForm");

careerForm.addEventListener("submit", function(event) {

  // Evitar recarga de la página
  event.preventDefault();

  const nombre = document.getElementById("nombre").value;

  document.getElementById("formMessage").textContent =
    "Gracias" +
    (nombre ? ", " + nombre : "") +
    ". Tu información fue registrada en esta demostración.";

  // Limpiar formulario
  careerForm.reset();

});
