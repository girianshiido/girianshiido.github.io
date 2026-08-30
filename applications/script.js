document.querySelectorAll('.project-nav a').forEach((link) => {
  link.addEventListener('click', () => link.blur());
});
