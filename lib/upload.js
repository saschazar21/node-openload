// Require necessary modules
const debug = require('debug')('node-openload');
const FormData = require('form-data');
const fs = require('fs');
const got = require('got');
const hasha = require('hasha');
const path = require('path');
const request = require('./request');

/**
 * The upload class - It's able to handle file urls and Buffers
 * @param {string} url The upload URL provided by the 'Get Upload URL' endpoint of the API
 * @param {object} config The upload configuration object. Should hold at least the 'file' property
 * @param {function} cb The callback function to emit progress values to
 * @returns Returns a Promise holding the JSON-parsed response body
 */
class Upload {
  constructor(url, config, cb) {
    this.url = url;
    this.conf = config;
    this.form = new FormData();
    this.isBuffer = Buffer.isBuffer(config.file);
    this.conf.sha1 = hasha(this.conf.file, {
      algorithm: 'sha1',
    });
    const upload = this.isBuffer ? this.conf.file :
      fs.createReadStream(path.resolve(process.cwd(), this.conf.file));
    const opt = !this.isBuffer ? {} : {
      contentType: this.conf.contentType,
    };

    if (this.conf.filename) {
      opt.filename = this.conf.filename;
    }

    this.form.append('file1', upload, opt);

    this.got = request(this.url, 'GET', this.conf)
    .then(d => got.post(d.url, {
      body: this.form,
    })
    .on('uploadProgress', (progress) => {
      if (typeof cb === 'function') {
        return cb(progress);
      }
      return null;
    }));
  }

  upload() {
    if (!this.conf.file || (typeof this.conf.file !== 'string' && !this.isBuffer)) {
      return Promise.reject(new Error('Wrong location type given; only file URL or Buffer supported'));
    }
    if (this.isBuffer && (!this.conf.filename || !this.conf.contentType)) {
      return Promise.reject(new Error('Buffer given, but no filename and/or no contentType'));
    }

    return this.got
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
  }
}

module.exports = Upload;
