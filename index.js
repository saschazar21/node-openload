/**
  * Just a simple application entry point.
  */
const openload = require('./lib/api');

module.exports = config => openload(config);
