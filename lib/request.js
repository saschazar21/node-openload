// Require necessary modules
const debug = require('debug')('node-openload');
const got = require('got');

// API URL
const OPENLOAD_URL = 'https://api.openload.co';

/**
  * Helper function to parse GET params
  * @param params JavaScript object containing GET parameter data
  * @param method The HTTP method - GET or POST
  * @returns GET parameter string
  */
const paramParser = (params, method) => {
  if (method === 'GET' && params !== null && typeof params === 'object') {
    const array = [];
    const keys = Object.keys(params);
    keys.forEach((prop) => {
      if (params[prop] && typeof params[prop] !== 'object' && typeof params[prop] !== 'function') {
        array.push(`${prop}=${params[prop]}`);
      }
    });
    debug(`paramParser: ?${array.join('&')}`);
    return `?${array.join('&')}`;
  }
  debug('paramParser: \'\'');
  return '';
};

/**
  * The basic HTTP request model,
  * returns a Promise
  *
  * @param location: The location of the desired endpoint
  * @param method The HTTP method for the request (mostly GET or POST)
  * @param params Necessary GET/POST parameters for the request
  * @returns A Promise containing the results of the HTTP request
  */
module.exports = (location, method, params) => got(`${OPENLOAD_URL}${location}${paramParser(params, method)}`, {
  method: method || 'GET',
  form: !!params,
  body: method === 'POST' ? params : null,
  json: params && params.json ? params.json : true,
})
.then((res) => {
  if (typeof res === 'string') {
    return JSON.parse(res);
  }
  return res;
})
.then((res) => {
  debug(res.body);
  if (parseInt(res.body.status, 10) === 200) {
    return res.body.result;
  }
  return Promise.reject(res.body);
})
.catch((e) => {
  debug(e);
  return Promise.reject(new Error({
    data: 'http',
    error: e.message || e,
  }));
});
