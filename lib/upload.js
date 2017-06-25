// Require necessary modules
const debug = require('debug')('node-openload');
const FormData = require('form-data');
const fs = require('fs');
const got = require('got');
const hasha = require('hasha');
const path = require('path');
const request = require('./request');

module.exports = (url, config) => {
  if (!config.location || (typeof config.location !== 'string' && !Buffer.isBuffer(config.location))) {
    return Promise.reject(new Error({
      data: 'upload',
      error: 'Wrong location type given; only file URL or Buffer supported',
    }));
  }

  const conf = config;
  const form = new FormData();
  conf.sha1 = hasha(conf.location, {
    algorithm: 'sha1',
  });
  const upload = Buffer.isBuffer(conf.location) ? conf.location :
    fs.createReadStream(path.resolve(process.cwd(), conf.location));
  form.append('file1', upload);
  delete conf.location;

  return request(url, 'GET', conf)
  /*.then(d => got.post(d.url, {
    body: form,
  }))*/
  .then(d => new Promise((resolve, reject) => {
    form.submit(d.url, (err, res) => {
      if (err) {
        return reject(new Error({
          data: 'upload',
          error: err.message || err,
        }));
      }
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        debug(body);
        resolve(body);
      });
    });
  }))
  .then(body => JSON.parse(body).result)
  .then((res) => {
    debug(res);
    return res;
  })
  .catch((e) => {
    debug(e);
    return Promise.reject(new Error({
      data: 'upload',
      error: e.message || e,
    }));
  });
};
