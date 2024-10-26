  document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = document.querySelector('.menu-toggle');
    const sideMenu = document.querySelector('.side-menu');
    const closeMenu = document.querySelector('.side-menu .close-menu');

    menuToggle.addEventListener('click', () => {
      sideMenu.classList.add('active');
    });

    closeMenu.addEventListener('click', () => {
      sideMenu.classList.remove('active');
    });
  });
