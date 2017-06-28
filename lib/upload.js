// Require necessary modules
const debug = require('debug')('node-openload');
const FormData = require('form-data');
const fs = require('fs');
const got = require('got');
const hasha = require('hasha');
const path = require('path');
const request = require('./request');

/**
 * The upload function - It's able to handle file urls and Buffers
 * @param {string} url The upload URL provided by the 'Get Upload URL' endpoint of the API
 * @param {object} config The upload configuration object. Should hold at least the 'file' property
 * @returns Returns a Promise holding the JSON-parsed response body
 */
module.exports = (url, config) => {
  const isBuffer = Buffer.isBuffer(config.file);
  if (!config.file || (typeof config.file !== 'string' && !isBuffer)) {
    return Promise.reject(new Error('Wrong location type given; only file URL or Buffer supported'));
  }
  if (isBuffer && (!config.filename || !config.contentType)) {
    return Promise.reject(new Error('Buffer given, but no filename and/or no contentType'));
  }

  const conf = config;
  const form = new FormData();
  conf.sha1 = hasha(conf.file, {
    algorithm: 'sha1',
  });
  const upload = isBuffer ? conf.file :
    fs.createReadStream(path.resolve(process.cwd(), conf.file));
  form.append('file1', upload, !isBuffer ? {} : {
    contentType: conf.contentType,
    filename: conf.filename,
  });
  delete conf.file;

  return request(url, 'GET', conf)
  .then(d => got.post(d.url, {
    body: form,
  }))
  .then((res) => {
    if (!res.body.length) {
      return Promise.reject(new Error('Empty response, this is not normal! Please check your upload data!'));
    }
    return res;
  })
  .then(res => JSON.parse(res.body).result)
  .catch((e) => {
    debug(e);
    return Promise.reject(new Error(e.message || e));
  });
};
