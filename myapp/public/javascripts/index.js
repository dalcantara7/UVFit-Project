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
      document.appendChild(menu);
      console.log(window.sessionStorage.getItem('token'));
    } else {
      const loginLink = document.createElement('a');
      loginLink.innerHTML = 'Login';
      loginLink.href = 'http://ec2-13-59-207-131.us-east-2.compute.amazonaws.com:3000/login';
      document.appendChild(loginLink);
    }
  };
})();