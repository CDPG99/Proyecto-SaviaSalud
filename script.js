// Virelia Health - comportamiento general compartido
const dropdownButtons = document.querySelectorAll('.nav-dropdown > .nav-btn');
const dropdownMenus = document.querySelectorAll('.dropdown-menu');

function closeDropdowns() {
  dropdownMenus.forEach(menu => menu.classList.remove('show'));
  dropdownButtons.forEach(button => button.setAttribute('aria-expanded', 'false'));
}

dropdownButtons.forEach(button => {
  const menu = button.nextElementSibling;
  if (!menu) return;

  button.addEventListener('click', event => {
    event.stopPropagation();
    const open = !menu.classList.contains('show');
    closeDropdowns();

    if (open) {
      menu.classList.add('show');
      button.setAttribute('aria-expanded', 'true');
    }
  });
});

document.addEventListener('click', event => {
  if (!event.target.closest('.nav-dropdown')) closeDropdowns();
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeDropdowns();
});
