/**
 * Utility javascript functions used to call Apstrata and perform generic funcitonality.
 */

// Credentials, domain, and context for Apstrata.
var APSDB_AUTH_KEY = 'W09CFC4BE3';
var APSDB_DOMAIN = 'apsdb.apstrata.com';
var APSDB_CONTEXT = 'sandbox-apsdb';

/**
 * Generate and sign an HTTP request to Apstrata, then call a success function.
 *
 * @param action
 *          An API in Apstrata like: SaveDocument, DeleteDocument, Query, RunScript, etc.
 * @param params
 *          Parameters to be sent to the Apstrata API call. These will also be passed back to
 *          the successFunction
 * @param callbackFunction
 *          Function to be called back after receiving a response from Apstrata
 * @param user
 *          Username to sign the request
 * @param pass
 *          Password to sign the request
 */
function generateURLAndAjax(action, params, callbackFunction, user, pass) {
  var apstrataUrl = 'http://' + APSDB_DOMAIN + '/' + APSDB_CONTEXT + '/rest';
  var timestamp = (new Date()).getTime();

  apstrataUrl += "/" + APSDB_AUTH_KEY;
  apstrataUrl += "/" + action;
  apstrataUrl += "?apsws.jc=?";

  var apstrataParams = {
    'apsws.authMode' : 'simple',
    'apsws.time' : timestamp ,
    'apsws.responseType' : 'json'
  };

  if (typeof(user) != 'undefined' && user && typeof(pass) != 'undefined' && pass) {
    // Hash the password.
    pass = calcMD5(pass).toUpperCase();
    var valueToHash = timestamp + user + action + pass;

    // Create the signature.
    var signature = calcMD5(valueToHash).toUpperCase();
    $.extend(apstrataParams, {'apsws.user' : user, 'apsws.authSig' : signature});
  }

  $.extend (apstrataParams, params);  

  $.ajax({
      url: apstrataUrl,
      type: 'GET',
      data: apstrataParams,
      dataType: 'jsonp',
      success: function(data) {
        callbackFunction(data, apstrataParams);
      }
    }
  );
}

/**
 *  Retrieve all the form parameter values in the form parent of the passed event, then return
 * an object containing the field names and values.
 *
 * @param target
 *
 * @return Object containing the names and values of the form controls of the passed event.
 */
function getFormValues(myForm) {
  var parameters = {};

  $.each(myForm.serializeArray(), function(index, field) {
    parameters[field.name] = field.value;
  });

  return parameters;
}

function isLoggedIn() {
  if (typeof(username) != 'undefined' && username && typeof(password) != 'undefined' && password)
    return true;
  else
    return false;
}