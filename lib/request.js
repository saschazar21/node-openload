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
    const keys = Object.keys(params);
    keys.forEach((val) => {
      if (params[val] !== null && typeof params[val] !== 'undefined') {
        array.push(`${val}=${params[val]}`);
      }
    });
    return `?${array.join('&')}`;
  }
  return '';
};

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
.then(body => JSON.parse(body))
.then((res) => {
  if (parseInt(res.status, 10) === 200) {
    return res;
  }
  return Promise.reject(res);
});
