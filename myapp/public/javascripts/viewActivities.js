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
    const url = 'http://13.59.207.131:3000/devices/getevents';

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
        document.getElementById('usertext').innerHTML = responseJSON.message;
        populateTable(responseJSON.events);
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
    // all activities table
    document.getElementById('events').innerHTML = '';
    const eventTable = document.createElement('table');
    let row = document.createElement('tr');
    let header = document.createElement('th');
    let data = document.createElement('td');
    let totalUV = 0.0;
    let totalSpeed = 0.0;
    let totalDuration = 0.0;

    header.innerHTML = 'Device ID';
    row.appendChild(header);
    header = document.createElement('th');
    header.innerHTML = 'Activity';
    row.appendChild(header);
    header = document.createElement('th');
    header.innerHTML = 'Longitude';
    row.appendChild(header);
    header = document.createElement('th');
    header.innerHTML = 'Latitude';
    row.appendChild(header);
    header = document.createElement('th');
    header.innerHTML = 'UV Value';
    row.appendChild(header);
    header = document.createElement('th');
    header.innerHTML = 'Speed';
    row.appendChild(header);
    header = document.createElement('th');
    header.innerHTML = 'Duration';
    row.appendChild(header);
    header = document.createElement('th');
    eventTable.appendChild(row);

    for (const event of events) {
      row = document.createElement('tr');
      row.innerHTML = '';
      data = document.createElement('td');
      data.innerHTML = event.deviceID;
      row.appendChild(data);
      data = document.createElement('td');
      data.innerHTML = event.activityType;
      row.appendChild(data);
      data = document.createElement('td');
      data.innerHTML = event.longitude;
      row.appendChild(data);
      data = document.createElement('td');
      data.innerHTML = event.latitude;
      row.appendChild(data);
      data = document.createElement('td');
      data.innerHTML = event.uvVal;
      row.appendChild(data);
      data = document.createElement('td');
      data.innerHTML = event.speed;
      row.appendChild(data);
      data = document.createElement('td');
      data.innerHTML = event.duration;
      row.appendChild(data);

      totalUV += event.uvVal;
      totalDuration += event.duration;
      totalSpeed += event.speed;

      row.addEventListener('click', function () {

      });

      eventTable.appendChild(row);
    }

    document.getElementById('events').appendChild(eventTable);

    // summary table
    document.getElementById('summary').innerHTML = '';
    const summaryTable = document.createElement('table');
    row = document.createElement('tr');
    header = document.createElement('th');
    data = document.createElement('td');

    const avgUV = totalUV / events.length;
    const avgDuration = totalDuration / events.length;
    const totalCalories = totalSpeed * totalDuration;
    const avgCalories = totalCalories / events.length;

    header.innerHTML = '';
    row.appendChild(header);
    header = document.createElement('th');
    header.innerHTML = 'Duration';
    row.appendChild(header);
    header = document.createElement('th');
    header.innerHTML = 'UV Exposure';
    row.appendChild(header);
    header = document.createElement('th');
    header.innerHTML = 'Calories Burned';
    row.appendChild(header);
    header = document.createElement('th');
    summaryTable.appendChild(row);

    // total activity
    row = document.createElement('tr');
    row.innerHTML = '';
    data = document.createElement('td');
    data.innerHTML = 'Total Activity';
    row.appendChild(data);
    data = document.createElement('td');
    data.innerHTML = totalDuration;
    row.appendChild(data);
    data = document.createElement('td');
    data.innerHTML = totalUV;
    row.appendChild(data);
    data = document.createElement('td');
    data.innerHTML = totalCalories;
    row.appendChild(data);
    summaryTable.appendChild(row);

    // avg activity
    row = document.createElement('tr');
    row.innerHTML = '';
    data = document.createElement('td');
    data.innerHTML = 'Average Activity';
    row.appendChild(data);
    data = document.createElement('td');
    data.innerHTML = avgDuration;
    row.appendChild(data);
    data = document.createElement('td');
    data.innerHTML = avgUV;
    row.appendChild(data);
    data = document.createElement('td');
    data.innerHTML = avgCalories;
    row.appendChild(data);
    summaryTable.appendChild(row);

    document.getElementById('summary').appendChild(summaryTable);
  }
})();