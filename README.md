# node-openload
An [Openload](https://openload.co) API wrapper for Node.JS using Promises.

## Prerequisites
* [Node.JS](https://nodejs.org) v4 (minimum)
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

Sample function call:
```js
ol.getAccountInfo()
  .then(info => console.log(info));   // Prints account info
```

#### getAccountInfo()
Returns information about your account.

#### getDownloadTicket(file)
Returns a download ticket, needed for actually downloading desired file afterwards.

**file**: The ID of your requested file.

**Caution:**  
* Sometimes the response also returns a `captcha_url` property holding an image link in the result.  
* In addition a `509: Bandwidth usage exceeded` error might be returned, this is the API's fault, not the fault of this module. Then a file download is not possible at this time.

#### getDownloadLink(obj)
Returns a download link for the requested file.

**obj**: Object containing data for the download:
```
{
  file:             // mandatory
  ticket:           // mandatory
  captcha_response:
}
```
* **file**: The ID of your requested file.
* **ticket**: The previously generated ticket.
* **captcha_response**: The response to the retrieved captcha image (only if there was a `captcha_url` returned with the download ticket).

#### getDownload(file)
Combines **getDownloadTicket(file)** and **getDownloadLink(obj)**.  
Either returns download link, or, if Captcha is necessary, returns response of **getDownloadTicket(file)**.

#### getFileInfo(file)
Returns info about given file id.

**file**: might consist of an Array or a string of comma-seperated file IDs. Max 50 IDs allowed.

#### listFolder(folder)
List contents (folders, files) of given folder id.

**folder**: The folder ID you want the contents listed of. *(not required)*

#### getFolder(folder)
Duplicate of **listFolder(folder)**.

#### remoteUpload(obj)  
Upload a file from a remote URL.

**obj**: Object containing data for the upload:
```
{
  url:             // mandatory
  folder:
  headers:
}
```
* **url**: The URL to the resource you want to upload.
* **folder**: The folder ID you would like to upload to. *(not required)*
* **headers**: If the desired resource needs special HTTP headers, please look up the [API documentation](https://openload.co/api).

#### remoteUploadStatus(obj)
Check the upload status of a previously initiated remote upload.

**obj**: Object containing data for the upload:
```
{
  id:
  limit:
}
```
* **id**: The remote upload ID. *(not required)*
* **limit**: Limit results (Default 5, Max. 100). *(not required)*

#### upload(obj)
Perform an upload of a local file.

**obj**: Object containing data for the upload:
```
{
  file:             // mandatory
  folder:
}
```
* **file**: The local path of your desired file.
* **folder**: The folder ID you want to upload to. *(not required)*


### Errors

All provided functions return a Promise.  
Every error object is formed like this:
```
{
  data:
  error:
}
```

* **data**: contains failed parameter, or 'config' if request wasn't executed due to lack of information.  
* **error**: holds returned response body, or error message as a string.

## Version history
* **1.0.0** - Initial version
