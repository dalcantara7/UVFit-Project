/* eslint-disable no-loop-func */

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
    document.getElementById('back').addEventListener('click', function () {
      document.getElementById('singletable').innerHTML = '';
      document.getElementById('singleactivity').style.display = 'none';
      document.getElementById('activityView').style.display = 'block';
    });
  };

  function showEvents() {
    let url = 'https://www.evanweiler.com:3443/devices/getactivities?local=f';

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

    navigator.geolocation.getCurrentPosition(function (position) {
      url = 'https://www.evanweiler.com:3443/devices/getactivities?local=t&lat='
          + encodeURIComponent(position.coords.latitude)
          + '&long='
          + encodeURIComponent(position.coords.longitude);

      fetch(url, fetchOptions)
        .then(checkStatus)
        .then(function (responseText) {
          const responseJSON = JSON.parse(responseText);
          populateLocal(responseJSON.activities);
        })
        .catch(function (error) {
          console.error('ERROR: ' + error);
        });
    });
  }

  function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
      return response.text();
    } else {
      return Promise.reject(new Error(response.status + ':' + response.statusText));
    }
  }

  // TODO: NEED TO BE AVERAGE, NOT ALL ACTIVITIES

  function populateLocal(activities) {
    document.getElementById('lastseven').innerHTML = '';

    const localTable = document.createElement('table');
    const d = new Date();
    let row = document.createElement('tr');
    let header = document.createElement('th');
    let data = document.createElement('td');

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
    localTable.appendChild(row);

    let numAct = 0;
    let avgUV = 0;
    let avgDuration = 0;
    let avgCalories = 0;

    for (const activity of activities) {
      if (d.getTime() - activity.startTime < 7 * 24 * 60 * 60 * 1000) {
        avgUV += activity.uvExposure;
        avgDuration += activity.duration;
        avgCalories += activity.avgSpeed * activity.distance;
        numAct++;
      }
    }

    avgUV /= numAct;
    avgDuration /= numAct;
    avgCalories /= numAct;

    row = document.createElement('tr');
    data = document.createElement('td');
    data.innerHTML = 'Average Activity:';
    row.appendChild(data);
    data = document.createElement('td');

    if (avgDuration) {
      data.innerHTML = avgDuration.toFixed(1);
    } else {
      data.innerHTML = '-';
    }

    row.appendChild(data);
    data = document.createElement('td');

    if (avgUV) {
      data.innerHTML = avgUV;
    } else {
      data.innerHTML = '-';
    }

    row.appendChild(data);
    data = document.createElement('td');

    if (avgCalories) {
      data.innerHTML = avgCalories.toFixed(2);
    } else {
      data.innerHTML = '-';
    }

    row.appendChild(data);
    row.appendChild(data);

    localTable.appendChild(row);

    document.getElementById('lastseven').appendChild(localTable);
  }

  function populateTable(activities) {
    // all activities table
    document.getElementById('activities').innerHTML = '';
    const eventTable = document.createElement('table');
    let row = document.createElement('tr');
    let header = document.createElement('th');
    let data = document.createElement('td');

    let totalUV = 0;
    let totalDuration = 0;
    let totalCalories = 0;

    header.innerHTML = 'Device ID';
    row.appendChild(header);
    header = document.createElement('th');
    header.innerHTML = 'Activity';
    row.appendChild(header);
    header = document.createElement('th');
    header.innerHTML = 'Start Time';
    row.appendChild(header);
    header = document.createElement('th');
    header.innerHTML = 'UV Exposure';
    row.appendChild(header);
    header = document.createElement('th');
    header.innerHTML = 'Average Speed (mph)';
    row.appendChild(header);
    header = document.createElement('th');
    header.innerHTML = 'Duration (s)';
    row.appendChild(header);
    header = document.createElement('th');
    header.innerHTML = 'Distance (sm)';
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
      data.innerHTML = activity.avgSpeed.toFixed(2);
      row.appendChild(data);
      data = document.createElement('td');
      data.innerHTML = activity.duration;
      row.appendChild(data);
      data = document.createElement('td');
      data.innerHTML = activity.distance.toFixed(3);
      row.appendChild(data);

      totalUV += activity.uvExposure;
      totalDuration += activity.duration;
      totalCalories += activity.avgSpeed * activity.distance;

      row.addEventListener('click', function () {
        document.getElementById('singleactivity').style.display = 'block';
        document.getElementById('activityView').style.display = 'none';
        const url = 'https://www.evanweiler.com:3443/devices/getevents?startTime=' + activity.startTime;

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

            showSingleActivity(responseJSON.events);
          })
          .catch(function (error) {
            console.error('ERROR: ' + error);
          });
      });

      eventTable.appendChild(row);
    }

    document.getElementById('activities').appendChild(eventTable);

    // summary table
    document.getElementById('summary').innerHTML = '';
    const summaryTable = document.createElement('table');
    row = document.createElement('tr');
    header = document.createElement('th');
    data = document.createElement('td');

    let avgUV = totalUV / activities.length;
    let avgDuration = totalDuration / activities.length;
    let avgCalories = totalCalories / activities.length;

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
    data.innerHTML = totalDuration.toFixed(1);
    row.appendChild(data);
    data = document.createElement('td');
    data.innerHTML = totalUV;
    row.appendChild(data);
    data = document.createElement('td');
    data.innerHTML = totalCalories.toFixed(2);
    row.appendChild(data);
    summaryTable.appendChild(row);

    // avg activity
    row = document.createElement('tr');
    row.innerHTML = '';
    data = document.createElement('td');
    data.innerHTML = 'Average Activity';
    row.appendChild(data);
    data = document.createElement('td');

    if (avgDuration) {
      data.innerHTML = avgDuration.toFixed(1);
    } else {
      data.innerHTML = '-';
    }

    row.appendChild(data);
    data = document.createElement('td');

    if (avgUV) {
      data.innerHTML = avgUV;
    } else {
      data.innerHTML = '-';
    }

    row.appendChild(data);
    data = document.createElement('td');

    if (avgCalories) {
      data.innerHTML = avgCalories.toFixed(2);
    } else {
      data.innerHTML = '-';
    }

    row.appendChild(data);
    summaryTable.appendChild(row);


    const d = new Date();
    let numAct = 0;
    avgUV = 0;
    avgDuration = 0;
    avgCalories = 0;

    for (const activity of activities) {
      if (d.getTime() - activity.startTime < 7 * 24 * 60 * 60 * 1000) {
        avgUV += activity.uvExposure;
        avgDuration += activity.duration;
        avgCalories += activity.avgSpeed * activity.distance;
        numAct++;
      }
    }

    avgUV /= numAct;
    avgDuration /= numAct;
    avgCalories /= numAct;

    // last 7 days
    row = document.createElement('tr');
    row.innerHTML = '';
    data = document.createElement('td');
    data.innerHTML = 'Last 7 days';
    row.appendChild(data);
    data = document.createElement('td');

    if (avgDuration) {
      data.innerHTML = avgDuration.toFixed(1);
    } else {
      data.innerHTML = '-';
    }

    row.appendChild(data);
    data = document.createElement('td');

    if (avgUV) {
      data.innerHTML = avgUV;
    } else {
      data.innerHTML = '-';
    }

    row.appendChild(data);
    data = document.createElement('td');

    if (avgCalories) {
      data.innerHTML = avgCalories.toFixed(2);
    } else {
      data.innerHTML = '-';
    }

    row.appendChild(data);
    summaryTable.appendChild(row);

    document.getElementById('summary').appendChild(summaryTable);
  }

  function showSingleActivity(events) {
    document.getElementById('singletable').innerHTML = '';
    const singleTable = document.createElement('table');
    let row = document.createElement('tr');
    let header = document.createElement('th');
    let data = document.createElement('td');

    header.innerHTML = 'Longitude';
    row.appendChild(header);
    header = document.createElement('th');
    header.innerHTML = 'Latitude';
    row.appendChild(header);
    header = document.createElement('th');
    header.innerHTML = 'UV Exposure';
    row.appendChild(header);
    header = document.createElement('th');
    header.innerHTML = 'Speed (mph)';
    row.appendChild(header);
    singleTable.appendChild(row);

    for (const event of events) {
      row = document.createElement('tr');
      row.innerHTML = '';
      data = document.createElement('td');
      data.innerHTML = event.longitude.toFixed(6);
      row.appendChild(data);
      data = document.createElement('td');
      data.innerHTML = event.latitude.toFixed(6);
      row.appendChild(data);
      data = document.createElement('td');
      data.innerHTML = event.uvVal;
      row.appendChild(data);
      data = document.createElement('td');
      data.innerHTML = event.speed;
      row.appendChild(data);
      singleTable.appendChild(row);
    }

    document.getElementById('singletable').appendChild(singleTable);
  }
})();