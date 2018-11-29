'use strict';

/**
 * Name: Evan Weiler
 * Section: 001
 * Description: comment
 */
(function () {
  /**
  * comment
  */
  window.onload = function () {
    document.getElementById('submit').addEventListener('click', userLogin);
  };

  function userLogin() {
    const url = 'http://13.59.207.131:3000/users/auth';

    const message = {
      email: document.getElementById('email').value,
      password: document.getElementById('password').value,
    };

    const fetchOptions = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    };

    fetch(url, fetchOptions)
      .then(checkStatus)
      .then(function (responseText) {
        const responseJSON = JSON.parse(responseText);
        if (responseJSON.token) {
          window.sessionStorage.setItem('token', responseJSON.token);
          window.sessionStorage.setItem('username', responseJSON.username);
          setTimeout(function () {
            window.location.replace('http://13.59.207.131:3000/');
          }, 2000);
        } else {
          document.getElementById('error').innerHTML = responseJSON.message;
        }
      })
      .catch(function (error) {
        console.error('ERROR: ' + error);
      });
  }

  function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
      return response.text();
    } else {
      return Promise.reject(new Error(response.status + ':' + response.statusText));
    }
  }
})();