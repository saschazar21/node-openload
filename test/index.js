// Quick test of Openload api
require('dotenv').config();
const openload = require('../index');

const ol = openload({
  'api_login': process.env.OPENLOAD_API_LOGIN,
  'api_key': process.env.OPENLOAD_API_KEY,
});

ol.getAccountInfo()
.then(d => console.log(d))
// .then(() => console.log('\n\n---- List folders & files ----\n'))
// .then(() => ol.listFolder())
// .then(d => d.result)
.then(() => ol.getDownloadLink('nrt9uzxRUpY'))
.then(d => console.log(d));
