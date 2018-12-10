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
    document.getElementById('submit').addEventListener('click', submitPreferences);
  };

  function submitPreferences() {
    // JIMMY: add input verification before this step
    const prefsJSON = {};

    if (document.getElementById('email').value !== '') {
      prefsJSON.email = document.getElementById('email').value;
    }
    if (document.getElementById('password').value !== '') {
      prefsJSON.password = document.getElementById('password').value;
    }
    if (document.getElementById('uvThresh').value !== '') {
      prefsJSON.uvThresh = document.getElementById('uvThresh').value;
    }

    const url = 'https://www.evanweiler.com:3000/users/setpreferences';

    const fetchOptions = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        x_auth: window.sessionStorage.getItem('token'),
      },
      body: JSON.stringify(prefsJSON),
    };

    fetch(url, fetchOptions)
      .then(checkStatus)
      .then(function (responseText) {
        const responseJSON = JSON.parse(responseText);
        document.getElementById('error').innerHTML = responseJSON.message;
        if (responseJSON.newtoken) {
          window.sessionStorage.setItem('token', responseJSON.newtoken);
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