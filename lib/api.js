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
    if (!config['api_login'] || !config['api_key']) {
      throw new Error('Openload: Please provide both api_login and api_key');
    }
    this.version = config['api_version'] || 1;
    this.locationPrefix = `/${this.version}`;
    this.config = {
      login: config['api_login'],
      key: config['api_key'],
    };
  }

  getAccountInfo() {
    return request(`${this.locationPrefix}/account/info`, 'GET', this.config)
    .catch(e => new Object({
      error: e,
    }));
  }

  getDownloadTicket(fileId) {
    const conf = this.config;
    conf.file = fileId;

    return request(`${this.locationPrefix}/file/dlticket`, 'GET', conf)
    .catch(e => new Object({
      fileId,
      error: e,
    }));
  }

  getDownloadLink(fileId) {
    return this.getDownloadTicket(fileId)
    .then((d) => {
      if (d.status > 200) {
        throw new Error(d);
      } else {
        return request(`${this.locationPrefix}/file/dl`, 'GET', {
          file: fileId,
          ticket: d.result.ticket,
        });
      }
    })
    .catch(e => new Object({
      fileId,
      error: e,
    }));
  }

  getFileInfo(file) {
    const conf = this.config;
    conf.file = file;
    if (!Array.isArray(file)) {
      conf.file = file.split(',');
    }
    if (conf.file.length < 50) {
      conf.file = conf.file.join(',');
      return request(`${this.locationPrefix}/file/info`, 'GET', conf)
      .catch(e => new Object({
        fileId,
        error: e,
      }));
    }
    throw new Error('File length must be < 50');
  }

  listFolder(folderId) {
    const conf = this.config;
    if (folderId) {
      conf.folder = folderId;
    }

    return request(`${this.locationPrefix}/file/listfolder`, 'GET', conf)
    .catch(e => new Object({
      folderId,
      error: e,
    }));
  }

  getFolder(folderId) {
    return this.listFolder(folderId);
  }

  upload(obj) {
    const conf = this.config;
    if (obj !== null && typeof obj === 'object') {
      if (!obj.file) {
        throw new Error('No file specified');
      }
      if (obj.folder) {
        conf.folder = obj.folder;
      }
      conf.location = obj.file;

      return upload(`${this.locationPrefix}/file/ul`, conf)
      .catch(e => new Object({
        file: conf.location,
        error: e,
      }));
    }
    throw new Error('Parameter must be object containing file property');
  }
};

module.exports = (config) => new Openload(config);
