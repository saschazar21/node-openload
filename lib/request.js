// Require necessary modules
const request = require('request-promise');

// API URL
const OPENLOAD_URL = 'https://api.openload.co';

/**
  * Helper function to parse GET params
  * @param params: JavaScript object containing GET parameter data
  * @returns GET parameter string
  */
const paramParser = (params) => {
  if (params !== null && typeof params === 'object') {
    const array = [];
    for (let key in params) {
      array.push(`${key}=${params[key]}`);
    }
    return `?${array.join('&')}`;
  }
  return '';
}

/**
  * The basic HTTP request model,
  * returns a Promise
  *
  * @param location: The location of the desired endpoint
  * @param method: The HTTP method for the request (mostly GET or POST)
  * @param params: Necessary GET/POST parameters for the request
  */
module.exports = (location, method, params) => request({
  method: method || 'GET',
  url: `${OPENLOAD_URL}${location}${paramParser(params)}`,
  form: params || {},
})
.then(body => JSON.parse(body));
