// Quick test of Openload api
require('dotenv').config();
const openload = require('../index');

let testId = 'enter your test id here';

// Be sure to set your API login details in .env,
// according to .env.sample
const ol = openload({
  api_login: process.env.OPENLOAD_API_LOGIN,
  api_key: process.env.OPENLOAD_API_KEY,
});

// Below is a testing suite, use it as your playground.
console.log('---- Test Openload API ----\n');
ol.getAccountInfo()
.then(d => console.log(d))
.then(() => console.log('\n\n---- List folders & files ----\n'))
.then(() => ol.listFolder(555))
.then(d => console.log(d))
.then(() => console.log('\n\n---- Remote upload media ----\n'))
.then(() => ol.remoteUpload({
  url: 'http://www.motivationalz.com/pictures/im_outta_here.jpg',
}))
.then((d) => {
  testId = d.result.id;
  console.log(d)
})
.then(() => console.log('\n\n---- Get file info ----\n'))
.then(() => ol.getFileInfo(testId))
.then(d => console.log(d))
.then(() => console.log('\n\n---- Get download link ----\n'))
.then(() => ol.getDownload(testId))
.then(d => console.log(d));
