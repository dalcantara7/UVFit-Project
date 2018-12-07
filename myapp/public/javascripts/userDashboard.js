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
    populateList();
    document.getElementById('activityStart').addEventListener('click', startActivity);
  };

  function startActivity() {
    const deviceID = document.getElementById('deviceList').value;

    const url = 'http://13.59.207.131:3000/devices/sendinfo';

    const fetchOptions = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        x_auth: window.sessionStorage.getItem('token'),
      },
      body: { deviceID: deviceID },
    };

    fetch(url, fetchOptions)
      .then(checkStatus)
      .catch(function (error) {
        console.error('ERROR: ' + error);
      });
  }

  function populateList() {
    const url = 'http://13.59.207.131:3000/users/getdevices';

    const fetchOptions = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        x_auth: window.sessionStorage.getItem('token'),
      },
    };

    fetch(url, fetchOptions)
      .then(checkStatus)
      .then(function (responseText) {
        const responseJSON = JSON.parse(responseText);

        for (const id of responseJSON.devices) {
          const option = document.createElement('option');
          option.value = id;
          option.innerHTML = id;
          document.getElementById('deviceList').appendChild(option);
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