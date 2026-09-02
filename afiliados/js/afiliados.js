// Virelia Health - JavaScript del módulo Afiliados
const faqQuestions = document.querySelectorAll('.faq-question');

faqQuestions.forEach(question => {
  question.addEventListener('click', () => {
    const answer = question.nextElementSibling;
    const icon = question.querySelector('span');
    if (!answer) return;

    const isOpen = answer.classList.contains('show');
    answer.classList.toggle('show');
    question.setAttribute('aria-expanded', String(!isOpen));

    if (icon) icon.textContent = isOpen ? '+' : '−';
  });
});
