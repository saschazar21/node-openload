// Import request model
const request = require('./request');
const upload = require('./upload');

// The Openload class
class Openload {
  /**
    * The constructor for the Openload class
    * @param config: A configuration object holding at least api_login & api_key
    */
  constructor(config) {
    if (!config.api_login || !config.api_key) {
      return Promise.reject({
        data: 'config',
        error: 'Openload init: Please provide both api_login and api_key',
      });
    }
    this.version = config.api_version || 1;
    this.locationPrefix = `/${this.version}`;
    this.config = {
      login: config.api_login,
      key: config.api_key,
    };
    return this;
  }

  getConfig() {
    return JSON.parse(JSON.stringify(this.config));
  }

  getAccountInfo() {
    return request(`${this.locationPrefix}/account/info`, 'GET', this.getConfig())
    .catch(e => Object({
      error: e,
    }));
  }

  getDownloadTicket(file) {
    const conf = this.getConfig();
    conf.file = file;

    return request(`${this.locationPrefix}/file/dlticket`, 'GET', conf)
    .catch(e => Object({
      data: file,
      error: e,
    }));
  }

  getDownloadLink(obj) {
    if (obj !== null && typeof obj === 'object') {
      if (!obj.file || !obj.ticket) {
        return Promise.reject({
          data: 'config',
          error: 'Both file & ticket must be specified',
        });
      }
      return request(`${this.locationPrefix}/file/dl`, 'GET', obj)
      .catch(e => Object({
        data: obj.file,
        error: e,
      }));
    }
    return Promise.reject({
      data: 'config',
      error: 'Parameter must be object containing file & ticket',
    });
  }

  getDownload(file) {
    return this.getDownloadTicket(file)
    .then((d) => {
      if (d.error) {
        return Promise.reject(d.error);
      }
      if (d.result.captcha_url) {
        return d;
      }
      return this.getDownloadLink({
        file,
        ticket: d.result.ticket,
      });
    })
    .catch(e => Object({
      data: file,
      error: e,
    }));
  }

  getFileInfo(file) {
    const conf = this.getConfig();
    conf.file = file;
    if (!Array.isArray(file)) {
      conf.file = file.split(',');
    }
    if (conf.file.length < 50) {
      conf.file = conf.file.join(',');
      return request(`${this.locationPrefix}/file/info`, 'GET', conf)
      .catch(e => Object({
        data: file,
        error: e,
      }));
    }
    return Promise.reject({
      data: 'config',
      error: 'File length must be < 50',
    });
  }

  listFolder(folder) {
    const conf = this.getConfig();
    if (folder) {
      conf.folder = folder;
    }

    return request(`${this.locationPrefix}/file/listfolder`, 'GET', conf)
    .catch(e => Object({
      data: folder || null,
      error: e,
    }));
  }

  getFolder(folder) {
    return this.listFolder(folder);
  }

  remoteUpload(obj) {
    const conf = this.getConfig();
    if (obj !== null && typeof obj === 'object') {
      if (!obj.url) {
        return Promise.reject({
          data: 'config',
          error: 'No URL specified',
        });
      }
      if (obj.folder) {
        conf.folder = obj.folder;
      }
      if (obj.headers) {
        conf.headers = obj.headers;
      }
      conf.url = obj.url;

      return request(`${this.locationPrefix}/remotedl/add`, 'GET', conf)
      .catch(e => Object({
        data: obj.url,
        error: e,
      }));
    }
    return Promise.reject({
      data: 'config',
      error: 'Parameter must be object containing url property',
    });
  }

  remoteUploadStatus(obj) {
    const conf = this.getConfig();
    if (obj !== null && typeof obj === 'object') {
      if (obj.limit) {
        conf.limit = obj.limit;
      }
      if (obj.id) {
        conf.id = obj.id;
      }
    }

    return request(`${this.locationPrefix}/remotedl/add`, 'GET', conf)
    .catch(e => Object({
      data: conf.id || conf.limit || null,
      error: e,
    }));
  }

  upload(obj) {
    const conf = this.getConfig();
    if (obj !== null && typeof obj === 'object') {
      if (!obj.file) {
        return Promise.reject({
          data: 'config',
          error: 'No file specified',
        });
      }
      if (obj.folder) {
        conf.folder = obj.folder;
      }
      conf.location = obj.file;

      return upload(`${this.locationPrefix}/file/ul`, conf)
      .catch(e => Object({
        file: conf.location,
        error: e,
      }));
    }
    return Promise.reject({
      data: 'config',
      error: 'Parameter must be object containing file property',
    });
  }
}

module.exports = config => new Openload(config);
