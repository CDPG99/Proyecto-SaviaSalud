// Virelia Health - JavaScript del módulo Nosotros
const careerForm = document.getElementById('careerForm');

if (careerForm) {
  careerForm.addEventListener('submit', event => {
    event.preventDefault();

    const nombre = document.getElementById('nombre')?.value || '';
    const message = document.getElementById('formMessage');

    if (message) {
      message.textContent = 'Gracias' + (nombre ? ', ' + nombre : '') + '. Tu información fue registrada en esta demostración.';
    }

    careerForm.reset();
  });
}
