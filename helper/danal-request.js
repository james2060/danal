var request = require('request');
const cipher = require("../helper/danal-cipher")
const  HashMap  = require ( 'hashmap'); 
const urlencode = require('urlencode');

var syncrequest = require('sync-request')
/******************************************************
*  DN_CREDIT_URL	: 결제 서버 정의
******************************************************/
const DN_CREDIT_URL = 'https://tx-creditcard.danalpay.com/credit/';
const DN_CREDIT_URI = "credit/"

/******************************************************
 *  Set Timeout
 ******************************************************/
var DN_CONNECT_TIMEOUT = 5000;
var DN_TIMEOUT = 30000; //SO_TIMEOUT setting.

var ERC_NETWORK_ERROR = "-1";
var ERM_NETWORK = "Network Error";

exports.upload = async function(httpurl, key, value) {

	let options = {
		url: httpurl,
		method: 'POST',
		formData : {
			'STARTPARAMS': value,

		},

	};

	try {
		let res = await rp(options);
		console.log(res);
	} catch (e) {
		console.log(e);
	}
}
/******************************************************
 *  Async Request POST
 ******************************************************/
exports.reqPost = function(cpid, data){

    var options = { 
        url:DN_CREDIT_URL,
        method: 'POST', 
        qs: {'CPID':cpid, 'DATA':data},
    /*headers: {
            'User-Agent': 'request'
          }*/
        } 

    console.log("befor request")


    request.post({
        url:DN_CREDIT_URL +'?CPID=' + cpid + '&DATA=' + data

    },function(error, response, body){

        decodeCipherText = urlencode.decode(body);

        const dataValue = decodeCipherText.split('=');

        //응답데이터 복호화 and Base64Decode 
        var decryptedData = cipher.decrypt(dataValue[1]);

        console.log(decryptedData);

        return decryptedData;

    });
    console.log("after request")
}
/******************************************************
 *  Sync Request POST
 ******************************************************/
exports.SyncreqPost = function(cpid, data){

    var res = syncrequest('POST', DN_CREDIT_URL +'?CPID=' + cpid + '&DATA=' + data)
  
    var resBody = res.getBody('utf-8');

    return resBody;
}
/******************************************************
 *  Sync Request application/x-www-form-urlencoded POST 
 ******************************************************/
exports.SyncreqPostXfu = function(url, key, value){

    console.log(url);
    var res = syncrequest('POST', url, {      
        
        form: {STARTPARAMS:value}
      
      });

    var resBody = res.getBody('utf-8');

    return resBody;
}
function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log("success");
        console.log(body);
        decodeCipherText = urlencode.decode(resData);

        //응답데이터 복호화 and Base64Decode 
        var responseFromDanal = cipher.decrypt(decodeCipherText);
        

        console.log(responseFromDanal);
        return responseFromDanal;
    }
}


