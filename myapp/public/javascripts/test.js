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
    document.getElementById('userPost').addEventListener('click', userPost);
    document.getElementById('userGet').addEventListener('click', userGet);
  };

  function userPost() {
    const url = document.getElementById('userInput').value;

    const message = {
      username: document.getElementById('userName').value,
      password: document.getElementById('userPass').value,
      email: document.getElementById('userEmail').value,
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
        console.log(responseText);
      })
      .catch(function (error) {
        console.error('ERROR: ' + error);
      });
  }

  function userGet() {
    const url = document.getElementById('userInput').value;

    fetch(url)
      .then(checkStatus)
      .then(function (responseText) {
        console.log(responseText);
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