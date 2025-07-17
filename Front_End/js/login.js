
    const container = document.getElementById('container');

    const toggle = () => {
      container.classList.toggle('sign-in');
      container.classList.toggle('sign-up');
    };

    window.addEventListener('DOMContentLoaded', () => {
      container.classList.add('sign-in');
    });

    // ✅ Password toggle logic
    document.querySelectorAll('.toggle-password').forEach((eyeIcon) => {
      eyeIcon.addEventListener('click', () => {
        const input = eyeIcon.previousElementSibling;
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        eyeIcon.classList.toggle('bx-show');
        eyeIcon.classList.toggle('bx-hide');
      });
    });
