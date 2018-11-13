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
        populateTable(JSON.parse(responseText));
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

  function populateTable(events) {
    document.getElementById('events').innerHTML = '';
    const eventTable = document.createElement('table');
    const row = document.createElement('tr');
    const header = document.createElement('th');
    const data = document.createElement('td');
    header.innerHTML = 'Device ID';
    row.appendChild(header);
    header.innerHTML = 'Longitude';
    row.appendChild(header);
    header.innerHTML = 'Latitude';
    row.appendChild(header);
    header.innerHTML = 'UV Value';
    row.appendChild(header);
    header.innerHTML = 'Speed';
    row.appendChild(header);
    header.innerHTML = 'Date';
    row.appendChild(header);
    eventTable.appendChild(row);

    for (const event of events) {
      row.innerHTML = '';
      data.innerHTML = event.deviceID;
      row.appendChild(data);
      data.innerHTML = event.longitude;
      row.appendChild(data);
      data.innerHTML = event.latitude;
      row.appendChild(data);
      data.innerHTML = event.uvVal;
      row.appendChild(data);
      data.innerHTML = event.speed;
      row.appendChild(data);
      data.innerHTML = event.published_at;
      row.appendChild(data);

      eventTable.appendChild(row);
    }

    document.getElementById('events').appendChild(eventTable);
  }
})();