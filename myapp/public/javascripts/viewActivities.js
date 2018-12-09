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
        populateTable(responseJSON.activities);
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

  function populateTable(activities) {
    console.log(activities);
    // all activities table
    document.getElementById('activities').innerHTML = '';
    const eventTable = document.createElement('table');
    let row = document.createElement('tr');
    let header = document.createElement('th');
    let data = document.createElement('td');

    header.innerHTML = 'Device ID';
    row.appendChild(header);
    header = document.createElement('th');
    header.innerHTML = 'Activity';
    row.appendChild(header);
    header = document.createElement('th');
    header.innerHTML = 'Start Time';
    row.appendChild(header);
    header = document.createElement('th');
    header.innerHTML = 'Average UV Exposure';
    row.appendChild(header);
    header = document.createElement('th');
    header.innerHTML = 'Average Speed';
    row.appendChild(header);
    header = document.createElement('th');
    header.innerHTML = 'Duration';
    row.appendChild(header);
    header = document.createElement('th');
    header.innerHTML = 'Distance';
    row.appendChild(header);
    eventTable.appendChild(row);

    for (const activity of activities) {
      row = document.createElement('tr');
      row.innerHTML = '';
      data = document.createElement('td');
      data.innerHTML = activity.deviceID;
      row.appendChild(data);
      data = document.createElement('td');
      data.innerHTML = activity.activityType;
      row.appendChild(data);
      data = document.createElement('td');
      data.innerHTML = activity.startTime;
      row.appendChild(data);
      data = document.createElement('td');
      data.innerHTML = activity.uvExposure;
      row.appendChild(data);
      data = document.createElement('td');
      data.innerHTML = activity.avgSpeed;
      row.appendChild(data);
      data = document.createElement('td');
      data.innerHTML = activity.duration;
      row.appendChild(data);
      data = document.createElement('td');
      data.innerHTML = activity.distance;
      row.appendChild(data);

      // totalUV += event.uvVal;
      // totalDuration += event.duration;
      // totalSpeed += event.speed;

      row.addEventListener('click', function () {
        console.log('placeholder');
      });

      eventTable.appendChild(row);
    }

    document.getElementById('activities').appendChild(eventTable);

    // summary table
    // document.getElementById('summary').innerHTML = '';
    // const summaryTable = document.createElement('table');
    // row = document.createElement('tr');
    // header = document.createElement('th');
    // data = document.createElement('td');

    // const avgUV = totalUV / events.length;
    // const avgDuration = totalDuration / events.length;
    // const totalCalories = totalSpeed * totalDuration;
    // const avgCalories = totalCalories / events.length;

    // header.innerHTML = '';
    // row.appendChild(header);
    // header = document.createElement('th');
    // header.innerHTML = 'Duration';
    // row.appendChild(header);
    // header = document.createElement('th');
    // header.innerHTML = 'UV Exposure';
    // row.appendChild(header);
    // header = document.createElement('th');
    // header.innerHTML = 'Calories Burned';
    // row.appendChild(header);
    // header = document.createElement('th');
    // summaryTable.appendChild(row);

    // // total activity
    // row = document.createElement('tr');
    // row.innerHTML = '';
    // data = document.createElement('td');
    // data.innerHTML = 'Total Activity';
    // row.appendChild(data);
    // data = document.createElement('td');
    // data.innerHTML = totalDuration;
    // row.appendChild(data);
    // data = document.createElement('td');
    // data.innerHTML = totalUV;
    // row.appendChild(data);
    // data = document.createElement('td');
    // data.innerHTML = totalCalories;
    // row.appendChild(data);
    // summaryTable.appendChild(row);

    // // avg activity
    // row = document.createElement('tr');
    // row.innerHTML = '';
    // data = document.createElement('td');
    // data.innerHTML = 'Average Activity';
    // row.appendChild(data);
    // data = document.createElement('td');
    // data.innerHTML = avgDuration;
    // row.appendChild(data);
    // data = document.createElement('td');
    // data.innerHTML = avgUV;
    // row.appendChild(data);
    // data = document.createElement('td');
    // data.innerHTML = avgCalories;
    // row.appendChild(data);
    // summaryTable.appendChild(row);

    // document.getElementById('summary').appendChild(summaryTable);
  }
})();