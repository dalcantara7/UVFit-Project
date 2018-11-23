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
    // console.log(window.location.pathname);
    if (window.sessionStorage.getItem('token')) {
      document.getElementById('loggedin').style.display = 'block';
      document.getElementById('loggedout').style.display = 'none';

      document.getElementById('welcomemessage').innerHTML = 'Welcome '
      + window.sessionStorage.getItem('username') + '!';

      document.getElementById('logoutlink').addEventListener('click', function () {
        window.sessionStorage.clear();
        window.location.reload();
      });
    } else {
      document.getElementById('loggedin').style.display = 'none';
      document.getElementById('loggedout').style.display = 'block';
    }
  };
})();