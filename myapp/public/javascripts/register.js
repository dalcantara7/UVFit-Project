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
    document.getElementById('submit').addEventListener('click', registerUser);
  };

  function registerUser() {
    const url = 'http://ec2-13-59-207-131.us-east-2.compute.amazonaws.com:3000/users/register/newuser';

    const message = {
      username: document.getElementById('username').value,
      password: document.getElementById('password').value,
      email: document.getElementById('email').value,
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
        if (responseJSON.success) {
          document.getElementById('error').innerHTML = responseJSON.message;
          setTimeout(window.location.replace('http://ec2-13-59-207-131.us-east-2.compute.amazonaws.com:3000/'), 3000);
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