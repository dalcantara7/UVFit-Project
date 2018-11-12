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
    showEvents();
  };

  function showEvents() {
    const url = 'http://ec2-13-59-207-131.us-east-2.compute.amazonaws.com:3000/devices/getevents';

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