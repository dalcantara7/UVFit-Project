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
        console.log(JSON.parse(responseText).success);
        if (responseText.success) {
          console.log('success');
          window.location.replace('http://ec2-13-59-207-131.us-east-2.compute.amazonaws.com:3000/home');
        } else {
          console.log('no success');
          // present error message
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