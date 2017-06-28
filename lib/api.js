/* eslint no-underscore-dangle: ["error", { "allowAfterThis": true }] */

// Import request model
const request = require('./request');
const upload = require('./upload');

// The Openload class
class Openload {
  /**
    * The constructor for the Openload class
    * @param {Object} config A configuration object holding at least api_login & api_key
    * @param {string} config.api_login The API login credential for Openload
    * @param {string} config.api_key The API key for Openload
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

  /**
   * Returns account info for the respective user:
   * https://openload.co/api#accountinfos
   * @returns A promise containing the user data retrieved from the API
   */
  getAccountInfo() {
    return request(`${this.locationPrefix}/account/info`, 'GET', this.config);
  }

  /**
   * Requests a download ticket for a certain file:
   * https://openload.co/api#download-ticket
   * @param {string} file The file ID the download ticket should be requested for
   * @returns A promise containing a download ticket ID, but sometimes also a captcha_url
   */
  getDownloadTicket(file) {
    const conf = this.config;
    conf.file = file;
    if (Array.isArray(file) || file.toString().split(',').length > 1) {
      return Promise.reject(new Error('Only one file allowed, please make sure to only include the file ID.'));
    }
    return request(`${this.locationPrefix}/file/dlticket`, 'GET', conf);
  }

  /**
   * Requests a download link in exchange for a submitted download ticket:
   * https://openload.co/api#download-getlink
   * @param {Object} obj The object containing necessary data for requesting a download link
   * @param {string} obj.file The file ID for which to request a download link
   * @param {string} obj.ticket The download ticket, required for issuing a download link
   * @param {string} obj.captcha_response The result of the previously issued captcha
   * @returns A promise containing the download link as 'url' property
   */
  getDownloadLink(obj) {
    if (obj !== null && typeof obj === 'object') {
      if (!obj.file || !obj.ticket) {
        return Promise.reject(new Error('Both file & ticket must be specified'));
      }
      return request(`${this.locationPrefix}/file/dl`, 'GET', obj);
    }
    return Promise.reject(new Error('Parameter must be object containing file & ticket'));
  }

  /**
   * A combined request for first requesting a download ticket and then requesting a download link
   * @param {string} file The file ID for which to request a download link
   * @returns A promise either containing a captcha url or a download ticket
   */
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

  /**
   * Requests the status of a certain file, if exists:
   * https://openload.co/api#download-info
   * @param {string} file The file ID to request the information for
   * @returns A promise containing information about the respective file
   */
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

  /**
   * Deletes up to 50 files using clustered requests:
   * https://openload.co/api#file-delete
   * @param {string|string[]} file The file ID to delete, can either be a single ID,
   *                                IDs separated by a comma or an array containing IDs
   * @returns A promise containing an array with 'true' values
   */
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

  /**
   * Shows the contents of a given folder:
   * https://openload.co/api#file-listfolder
   * @param {string} folder (optional) a folder ID to return information for
   * @returns A promise containing information about the respective folder
   */
  listFolder(folder) {
    const conf = this.config;
    if (folder) {
      conf.folder = folder;
    }

    return request(`${this.locationPrefix}/file/listfolder`, 'GET', conf);
  }

  /**
   * Alias function for listFolder():
   * https://openload.co/api#file-listfolder
   * @param {string} folder (optional) a folder ID to return information for
   * @returns A promise containing information about the respective folder
   */
  getFolder(folder) {
    return this.listFolder(folder);
  }

  /**
   * Upload a file from a remote URL:
   * https://openload.co/api#remoteul-add (sic!)
   * @param {Object} obj The object containing information about the file to upload
   * @param {string} obj.url The URL of the file to upload
   * @param {string} obj.folder (optional) The folder to upload the file to
   * @param {string} obj.headers (optional) If additional headers required, place them here
   * @returns A promise containing data about the upload (id, folderid)
   */
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

  /**
   * Check the status of the previously remotely uploaded files:
   * https://openload.co/api#remoteul-check (sic!)
   * @param {Object} obj The object containing necessary information about the requested file
   * @param {string} obj.limit (optional) The limit of results (min: 5, max: 100)
   * @param {string} obj.id (optional) The ID of the remote upload
   * @returns A promise listing all previous remote uploads containing their information
   */
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

  /**
   * Uploads a file to Openload:
   * https://openload.co/api#upload
   * @param {Object} obj The object containing necessary information about the upload
   * @param {string} obj.folder (optional) The folder ID to upload the file to
   * @param {string|Buffer} obj.file The file, either as local URL or as Buffer
   * @param {string} obj.filename (optional) When using a Buffer as upload, also append a file name
   * @param {string} obj.contentType (optional) When using a Buffer as upload, also append the file's content Type
   * @returns A promise containing information about the uploaded file
   */
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
