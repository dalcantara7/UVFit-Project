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
    document.getElementById('submit').addEventListener('click', registerDevice);
  };

  function registerDevice() {
    const url = 'http://ec2-13-59-207-131.us-east-2.compute.amazonaws.com:3000/devices/register';
    const token = window.sessionStorage.getItem('token');

    const message = {
      deviceID: document.getElementById('deviceID').value,
    };

    const fetchOptions = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        x_auth: token,
      },
      body: JSON.stringify(message),
    };

    console.log(fetchOptions);

    fetch(url, fetchOptions)
      .then(checkStatus)
      .then(function (responseText) {
        const responseJSON = JSON.parse(responseText);
        console.log(responseJSON);
        if (responseJSON.success) {
          document.getElementById('error').innerHTML = responseJSON.message;
          setTimeout(function () {
            window.location.replace('http://ec2-13-59-207-131.us-east-2.compute.amazonaws.com:3000/');
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