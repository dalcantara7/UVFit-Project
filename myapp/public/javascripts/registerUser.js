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
    const url = 'https://www.evanweiler.com:3443/users/register';

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
    
    if(!validateForm()) {
        return false;
    }

    fetch(url, fetchOptions)
      .then(checkStatus)
      .then(function (responseText) {
        const responseJSON = JSON.parse(responseText);
        if (responseJSON.success) {
          document.getElementById('error').innerHTML = responseJSON.message;
          setTimeout(function () {
            window.location.replace('https://www.evanweiler.com:3443/');
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

  function validateForm() {
    var flag = true;  
    
    if ($('#email').val().length === 0) {
      $('#email').addClass('error');
      $('#email').css({"display": "block"});
      flag = false;
    } else {
      $('#email').removeClass('error');
      $('#email').css({"display": "none"});
    }

    if (($('#password').val().length <= 7)) {
      $('#password').addClass('error');
      $('#password').css({"display": "block"});
      flag = false;
    } else {
      $('#password').removeClass('error');
      $('#password').css({"display": "none"});
    }
    
    if ($('#password').val() === $('#re_pass').val()) {
      $('#password').addClass('error');
      $('#re_pass').addClass('error');
      $('#password').css({"display": "block"});
      $('#re_pass').css({"display": "block"});
      flag = false;
    } else {
      $('#password').removeClass('error');
      $('#re_pass').removeClass('error');
      $('#password').css({"display": "none"});
      $('#re_pass').css({"display": "none"});
    }

    $('#email').click(function () {
      $('#email').removeClass('error');
    });

    $('#password').click(function () {
      $('#password').removeClass('error');
    });
    
    $('#re_pass').click(function () {
      $('#re_pass').removeClass('error');
    });
    
    return flag;
  }
})();