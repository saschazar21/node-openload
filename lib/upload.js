// Require necessary modules
const request = require('./request');
const rq = require('request-promise');
const fs = require('fs');
const path = require('path');
const hasha = require('hasha');

module.exports = (url, config) => {
  const conf = config;
  const location = path.resolve(__dirname, conf.location);
  conf.sha1 = hasha(location, {
    algorithm: 'sha1',
  });

  return request(url, 'GET', config)
  .then(d => rq.post({
    url: d.result.url,
    formData: {
      file1: fs.createReadStream(location),
    },
  }))
  .then(d => JSON.parse(d))
  .catch(e => new Object({
    file: location,
    error: e,
  }));
};
