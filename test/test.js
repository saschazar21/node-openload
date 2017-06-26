/* global describe it */

/**
 * Require necessary modules
 */
const dotenv = require('dotenv');
const debug = require('debug')('node-openload-test');
const got = require('got');
const path = require('path');
const should = require('chai').should();

const ol = require('../index');

let openload;

describe('Setup', () => {
  it('should successfully create node-openload instance', (done) => {
    if (!process.env.OPENLOAD_API_LOGIN && !process.env.OPENLOAD_API_KEY) {
      try {
        dotenv.config({
          path: path.resolve(__dirname, '../.env'),
          encoding: 'utf8',
        });
      } catch (e) {
        return done(e);
      }
    }

    try {
      openload = ol({
        api_login: process.env.OPENLOAD_API_LOGIN,
        api_key: process.env.OPENLOAD_API_KEY,
      });
      return done();
    } catch (e) {
      return done(e);
    }
  });
});

describe('node-openload', () => {
  it('should fetch user data from the API', () => openload.getAccountInfo()
    .then((data) => {
      debug(data);
      data.should.be.a('object');
      data.should.have.property('email');
      data.should.have.property('storage_used');
      data.should.have.property('storage_left');
    }));

  it('should list root folders', () => openload.listFolder()
    .then((data) => {
      debug(data.folders);
      data.should.be.a('object');
    }));

  it('should fetch information about a random folder', () => openload.listFolder()
    .then((data) => {
      const folders = data.folders;
      if (folders.length < 1) {
        debug('No folders present :-(');
        return Promise.reject();
      }
      const random = Math.floor(Math.random() * folders.length);
      debug(`Folder name: ${folders[random].name}`);
      return folders[random].id;
    })
    .then(id => openload.getFolder(id))
    .then((data) => {
      debug(data);
      data.should.have.property('folders');
      data.should.have.property('files');
    }));

  it('should remote upload an image and fetch upload information: adler-2386314_960_720.jpg', () => openload.remoteUpload({
    url: 'https://cdn.pixabay.com/photo/2017/06/09/09/39/adler-2386314_960_720.jpg',
  })
    .then(data => data.id)
    .then(id => openload.remoteUploadStatus(id))
    .then(data => debug(data)));

  it('should fetch a download link', () => openload.remoteUploadStatus()
    .then((data) => {
      let extid = null;
      Object.keys(data).forEach((prop) => {
        if (data[prop].extid !== false) {
          extid = data[prop].extid;
        }
      });
      if (extid === null) {
        return Promise.reject('No finished remote download found.');
      }
      debug(`Remote download file ID: ${extid}`);
      return extid;
    })
    .then(id => openload.getDownload(id))
    .then((data) => {
      debug(data);
    }));

  it('should delete the previously uploaded image', function deleteFile() {
    this.timeout(5000);
    return openload.listFolder()
    .then(data => data.files)
    .then(data => data.filter(file => file.name === 'adler-2386314_960_720.jpg'))
    .then(data => data.map(file => file.linkextid))
    .then(data => openload.deleteFile(data))
    .then(data => debug(data));
  });

  it('should upload a local image and delete it afterwards', function uploadFile() {
    this.timeout(5000);
    return openload.upload({
      file: './test/adler-2386314_960_720.jpg',
    })
    .then((res) => {
      debug(res);
      res.should.have.property('name');
      res.should.have.property('size');
      res.should.have.property('sha1');
      res.should.have.property('content_type');
      return res;
    })
    .then(res => openload.deleteFile(res.id));
  });

  it('should download a buffer, upload it and delete it afterwards', function uploadBuffer() {
    this.timeout(5000);
    const url = 'https://cdn.pixabay.com/photo/2017/06/09/09/39/adler-2386314_960_720.jpg';
    return got(url, {
      encoding: null,
    })
    .then(res => res.body)
    .then((body) => {
      body.should.have.property('byteLength');
      const isBuffer = Buffer.isBuffer(body);
      isBuffer.should.be.true;
      return body;
    })
    .then(buffer => openload.upload({
      file: buffer,
      contentType: 'image/jpeg',
      filename: 'adler-2386314_960_720.jpg',
    }))
    .then((res) => {
      debug(res);
      res.should.have.property('name');
      res.should.have.property('size');
      res.should.have.property('sha1');
      res.should.have.property('content_type');
      return res;
    })
    .then(res => openload.deleteFile(res.id));
  });
});
