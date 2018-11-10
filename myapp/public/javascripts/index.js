'use strict';

/**
 * Name: Evan Weiler
 * Section: 001
 * Description:
 */
(function () {
  /**
  * comment
  */
  window.onload = function () {
    if (window.sessionStorage.getItem('token')) {
      const menu = document.createElement('p');
      menu.innerHTML = 'logged in!';
      document.body.appendChild(menu);
      console.log(window.sessionStorage.getItem('token'));

      const logoutLink = document.createElement('a');
      logoutLink.href = '';
      logoutLink.innerHTML = 'Logout';
      logoutLink.addEventListener('click', function () {
        window.sessionStorage.clear();
        window.location.reload();
      });
      document.body.appendChild(logoutLink);
    } else {
      const loginLink = document.createElement('a');
      loginLink.innerHTML = 'Login';
      loginLink.href = 'http://ec2-13-59-207-131.us-east-2.compute.amazonaws.com:3000/login';
      document.body.appendChild(loginLink);

      const registerLink = document.createElement('a');
      registerLink.innerHTML = 'Register';
      registerLink.href = 'http://ec2-13-59-207-131.us-east-2.compute.amazonaws.com:3000/users/register';
      document.body.appendChild(registerLink);
    }
  };
})();