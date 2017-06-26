// Require necessary modules
const debug = require('debug')('node-openload');
const got = require('got');

// API URL
const OPENLOAD_URL = 'https://api.openload.co';

/**
  * The basic HTTP request model,
  * returns a Promise
  *
  * @param location: The location of the desired endpoint
  * @param method The HTTP method for the request (mostly GET or POST)
  * @param params Necessary GET/POST parameters for the request
  * @returns A Promise containing the results of the HTTP request
  */
module.exports = (location, method, params) => got(`${OPENLOAD_URL}${location}`, {
  method: method || 'GET',
  form: !!params,
  body: method === 'POST' ? params : null,
  json: params && params.json ? params.json : true,
  query: params,
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
  return Promise.reject(new Error(`Error ${res.body.status} - ${res.body.msg}`));
})
.catch((e) => {
  debug(e);
  return Promise.reject(new Error(e.message || e));
});
