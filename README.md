# node-openload
An [Openload](https://openload.co) API wrapper for Node.JS using Promises. Now in `v2.0.0`.

* Author: [Sascha Zarhuber](https://sascha.work)
* GitHub: [@saschazar21](https://github.com/saschazar21)
* Twitter: [@saschazar](https://twitter.com/saschazar)
* Source: [https://github.com/saschazar21/node-openload](https://github.com/saschazar21/node-openload)
* Issues: [https://github.com/saschazar21/node-openload/issues](https://github.com/saschazar21/node-openload/issues)
* Releases: [https://github.com/saschazar21/node-openload/releases](https://github.com/saschazar21/node-openload/releases)

## Prerequisites
* [Node.JS](https://nodejs.org) v6 and above
* [Openload](https://openload.co) API key (available after registration)

## Install
`npm install --save node-openload`

## Usage
Create an instance by using the following configuration:
```js
const openload = require('node-openload');
const ol = openload({
  api_login: YOUR-API-LOGIN-HERE,
  api_key: YOUR-API-KEY-HERE,
});
```

### Functions
Below the available functions are listed. The structure of the returned object may be looked up at the [API documentation](https://openload.co/api).  
By default, this module returns only the `result` property from the API response.

Sample function call:
```js
ol.getAccountInfo()
  .then(info => console.log(info));   // Prints account info
```

#### getAccountInfo()
Returns information about your account.

#### getDownloadTicket(file)
Returns a download ticket, needed for actually downloading desired file afterwards.

`file`: The ID of your requested file.

**Caution:**  
* Sometimes the response also returns a `captcha_url` property holding an image link in the result.  
* In addition a `509: Bandwidth usage exceeded` error might be returned, this is the API's fault, not the fault of this module. Then a file download is not possible at this time.

#### getDownloadLink(obj)
Returns a download link for the requested file.

`obj`: Object containing data for the download:
```
{
  file:             // mandatory
  ticket:           // mandatory
  captcha_response:
}
```
* `obj.file`: The ID of your requested file.
* `obj.ticket`: The previously generated ticket.
* `captcha_response`: The response to the retrieved captcha image (only if there was a `captcha_url` returned with the download ticket).

#### getDownload(file)
Combines **getDownloadTicket(file)** and **getDownloadLink(obj)**.  
Either returns download link, or, if Captcha is necessary, returns response of **getDownloadTicket(file)**.

#### getFileInfo(file)
Returns info about given file id.

`file`: might consist of an Array or a string of comma-seperated file IDs. Max 50 IDs allowed.

#### deleteFile(file)
Deletes files based on given file id.

`file`: might consist of an Array or a string of comma-seperated file IDs. Max 50 IDs allowed.

#### listFolder(folder)
List contents (folders, files) of given folder id.

`folder`: The folder ID you want the contents listed of. *(not required)*

#### getFolder(folder)
Duplicate of **listFolder(folder)**.

#### remoteUpload(obj)  
Upload a file from a remote URL.

`obj`: Object containing data for the upload:
```
{
  url:             // mandatory
  folder:
  headers:
}
```
* `obj.url`: The URL to the resource you want to upload.
* `obj.folder`: The folder ID you would like to upload to. *(not required)*
* `obj.headers`: If the desired resource needs special HTTP headers, please look up the [API documentation](https://openload.co/api).

#### remoteUploadStatus(obj)
Check the upload status of a previously initiated remote upload.

`obj`: Object containing data for the upload:
```
{
  id:
  limit:
}
```
* `obj.id`: The remote upload ID. *(not required)*
* `obj.limit`: Limit results (Default 5, Max. 100). *(not required)*

#### upload(obj)
Perform an upload of a local file.

`obj`: Object containing data for the upload:
```
{
  file:             // mandatory
  folder:
  filename:
  contentType
}
```
* `obj.file`: A buffer or the local path of your desired file.
* `obj.folder`: The folder ID you want to upload to. *(not required)*
* `obj.filename`: The file's name. *(only required if using a buffer)*
* `obj.contentType`: The file's content type. *(only required if using a buffer)*


### Errors

All provided functions return a Promise. If an error occurs, the module rejects the Promise using an `Error` object containing short informational message.


## Issues
Please report any bugs or issues to the [issues](https://github.com/saschazar21/node-openload/issues) section.

## Contribution
Contributors welcome!  
Please fork this repository, open a pull request and drop me a line on [twitter](https://twitter.com/saschazar/).

## Credits
* **@sindresorhus** for [got](https://github.com/sindresorhus/got) and [hasha](https://github.com/sindresorhus/hasha)
* **@alexindigo** for [form-data](https://github.com/form-data/form-data)
* **@tootallnate** for [debug](https://github.com/visionmedia/debug)
* **@dasilvacontin** for [mocha](https://github.com/mochajs/mocha)
* **@chaijs** for [chai](https://github.com/chaijs/chai)

## Disclaimer
I am not affiliated with [Openload](https://openload.co/) and/or its owners in any way. This source code is the result of my very own interests and is either written by me and/or any contributor listed in the [contributors section](https://github.com/saschazar21/node-openload/graphs/contributors). Therefore I am not liable for any content users of this source code are processing in any way.  
If you feel there is something wrong with this repository or the source code it contains, please open up a new [issue](https://github.com/saschazar21/node-openload/issues).

## License
MIT

## Milestones
* Add missing API endpoints (*Convert a file, Show running converts, Show failed converts, Get splash image*)
* Find a better way to handle captcha responses

## Version history
* **2.0.0** - Refactored `v1.0.0`, now also supporting buffers as upload content type. Added `deleteFile()`. Dropped [request](https://www.npmjs.com/package/request) in favor of [got](https://github.com/sindresorhus/got). Added tests using [mocha](http://mochajs.org/).
* **1.0.0** - Initial version
