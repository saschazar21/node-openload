/* eslint no-underscore-dangle: ["error", { "allowAfterThis": true }] */

// Import request model
const request = require('./request');
const upload = require('./upload');

// The Openload class
class Openload {
  /**
    * The constructor for the Openload class
    * @param config A configuration object holding at least api_login & api_key
    */
  constructor(config) {
    if (!config.api_login || !config.api_key) {
      return Promise.reject(new Error('Openload init: Please provide both api_login and api_key'));
    }
    this._version = config.api_version || 1;
    this._locationPrefix = `/${this._version}`;
    this._config = {
      login: config.api_login,
      key: config.api_key,
    };
  }

  get config() {
    return JSON.parse(JSON.stringify(this._config));
  }

  set config(obj) {
    this._config = obj;
  }

  get locationPrefix() {
    return this._locationPrefix;
  }

  getAccountInfo() {
    return request(`${this.locationPrefix}/account/info`, 'GET', this.config);
  }

  getDownloadTicket(file) {
    const conf = this.config;
    conf.file = file;
    if (Array.isArray(file) || file.toString().split(',').length > 1) {
      return Promise.reject(new Error('Only one file allowed, please make sure to only include the file ID.'));
    }
    return request(`${this.locationPrefix}/file/dlticket`, 'GET', conf);
  }

  getDownloadLink(obj) {
    if (obj !== null && typeof obj === 'object') {
      if (!obj.file || !obj.ticket) {
        return Promise.reject(new Error('Both file & ticket must be specified'));
      }
      return request(`${this.locationPrefix}/file/dl`, 'GET', obj);
    }
    return Promise.reject(new Error('Parameter must be object containing file & ticket'));
  }

  getDownload(file) {
    if (Array.isArray(file) || file.toString().split(',').length > 1) {
      return Promise.reject(new Error('Only one file allowed, please make sure to only include the file ID.'));
    }
    return this.getDownloadTicket(file)
    .then((d) => {
      if (d.captcha_url) {
        return d;
      }
      return this.getDownloadLink({
        file,
        ticket: d.ticket,
      });
    });
  }

  getFileInfo(file) {
    const conf = this.config;
    conf.file = file;
    if (!Array.isArray(file)) {
      conf.file = conf.file.toString().split(',').map(entry => entry.trim());
    }
    if (conf.file.length < 50) {
      conf.file = conf.file.join(',');
      return request(`${this.locationPrefix}/file/info`, 'GET', conf);
    }
    return Promise.reject(new Error('File length must be < 50'));
  }

  deleteFile(file) {
    const conf = this.config;
    conf.file = file;
    if (!Array.isArray(file)) {
      conf.file = conf.file.toString().split(',').map(entry => entry.trim());
    }
    if (conf.file.length < 50) {
      const promises = [];
      const ids = conf.file.slice();
      delete conf.file;
      ids.forEach(id => promises.push(request(`${this.locationPrefix}/file/delete`, 'GET', {
        login: conf.login,
        key: conf.key,
        file: id,
      })));
      return Promise.all(promises);
    }
    return Promise.reject(new Error('File length must be < 50'));
  }

  listFolder(folder) {
    const conf = this.config;
    if (folder) {
      conf.folder = folder;
    }

    return request(`${this.locationPrefix}/file/listfolder`, 'GET', conf);
  }

  getFolder(folder) {
    return this.listFolder(folder);
  }

  remoteUpload(obj) {
    const conf = this.config;
    if (obj !== null && typeof obj === 'object') {
      if (!obj.url) {
        return Promise.reject('No URL specified');
      }
      if (obj.folder) {
        conf.folder = obj.folder;
      }
      if (obj.headers) {
        conf.headers = obj.headers;
      }
      conf.url = obj.url;

      return request(`${this.locationPrefix}/remotedl/add`, 'GET', conf);
    }
    return Promise.reject(new Error('Parameter must be object containing url property'));
  }

  remoteUploadStatus(obj) {
    const conf = this.config;
    if (obj !== null && typeof obj === 'object') {
      if (obj.limit) {
        conf.limit = obj.limit;
      }
      if (obj.id) {
        conf.id = obj.id;
      }
    }

    return request(`${this.locationPrefix}/remotedl/status`, 'GET', conf);
  }

  upload(obj) {
    const conf = this.config;
    if (obj !== null && typeof obj === 'object') {
      if (!obj.file) {
        return Promise.reject(new Error('No file specified'));
      }
      Object.keys(obj).forEach((key) => {
        conf[key] = obj[key];
      });

      return upload(`${this.locationPrefix}/file/ul`, conf);
    }
    return Promise.reject(new Error('Parameter must be object containing file property'));
  }
}

module.exports = config => new Openload(config);
