/*
    @author kisookang
    @date 2021-05-16
    @email verynicesoo78@gmail.com
    @note Danal CP Ready 
    @call flow: 1.readyData_for_request - 2.doReady - 3.doReadyRedirect
*/


var express = require('express');
var router = express.Router();

const assert = require('assert');
const cipher = require("../helper/danal-cipher");
const reqHttp = require("../helper/danal-request");
const  HashMap  = require ( 'hashmap'); 
const urlencode = require('urlencode');
const url = require('url');
const apiResponse = require('../helper/apiResponse');
const { result } = require('lodash');

/**************************************************
 * 고정값 정의 - 실서비스를 위해서는 반드시 교체 필요
 **************************************************/
const CPID = "9810030929"; 
const CRYPTOKEY = Buffer.from("20ad459ab1ad2f6e541929d50d24765abb05850094a9629041bebb726814625d", 'hex');
const IVKEY = Buffer.from("d7d02c92cb930b661f107cb92690fc83", 'hex'); // IV 고정값.

/**************************************************
 * danal 응답데이터를 파싱하여  key-value 배열로 리턴한다.
 **************************************************/
function  str2data(qs) {
    const queryString = qs.substr(1);
    const chunks = qs.split('&');

    let result = {};

    chunks.forEach(chunk => {
        const [ key, value ] = chunk.split('=');
        var decoded = urlencode.decode(value,"EUC-KR");
        result[key] = decoded;
    });
    return result;
}
/**************************************************
 * request data를 url encode gkdu string 으로 리턴한다.
 **************************************************/
function data2string(mapobj){

    let sb="";

    mapobj.forEach(function(value, key) {
        //console.log(key + " : " + value);

        sb += key;
        sb += '=';
        sb+= urlencode.encode(value);
        sb+='&';
    });

    return sb;
}
/* STEP 1* */
function readyData_for_request(){
    try{
        /******************************************************
         *  RETURNURL 	: CPCGI페이지의 Full URL
         *  CANCELURL 	: BackURL페이지의 Full URL
         ******************************************************/
        const RETURNURL = "http://your.domain/CPCGI.jsp";
        const CANCELURL = "http://your.domain/Cancel.jsp";

        const TEST_AMOUNT = "301";
        var  REQ_DATA  = new HashMap ( ) ; 
        /**************************************************
         * SubCP 정보
         **************************************************/
        REQ_DATA.set("SUBCPID", "");
        /**************************************************
         * 결제 정보
         **************************************************/
        REQ_DATA.set("AMOUNT", TEST_AMOUNT);
        REQ_DATA.set("CURRENCY", "410");
        REQ_DATA.set("ITEMNAME", "TestItem");
        REQ_DATA.set("USERAGENT", "WP");
        REQ_DATA.set("ORDERID", "Danal_202105141445436615376");
        REQ_DATA.set("OFFERPERIOD", "2015102920151129");
        /**************************************************
         * 고객 정보
         **************************************************/
        REQ_DATA.set("USERNAME", "kisookang");  // 구매자 이름
        REQ_DATA.set("USERID", "userid");       // 사용자 ID
        REQ_DATA.set("USEREMAIL", "useremail"); // 소보법 email수신처
        /**************************************************
         * URL 정보
         **************************************************/
        REQ_DATA.set("CANCELURL", CANCELURL);
        REQ_DATA.set("RETURNURL", RETURNURL);
        /**************************************************
         * 기본 정보
         **************************************************/
        REQ_DATA.set("TXTYPE", "AUTH");
        REQ_DATA.set("SERVICETYPE", "DANALCARD");
        REQ_DATA.set("ISNOTI", "N");
        REQ_DATA.set("BYPASSVALUE", "this=is;a=test;bypass=value"); 
        // BILL응답 또는 Noti에서 돌려받을 값. '&'를 사용할 경우 값이 잘리게되므로 유의.

        var cpdata = data2string(REQ_DATA);
        var cipherText = urlencode.encode(cipher.encrypt(cpdata));

        return cipherText;

    } catch (error) {
    console.error(error);
    return "error";
  }
}
//step 2
function doReady(readyData){
    try{
        /**********************************************************
         * Request for Ready
         * aSync callback 방식으로 호출하고 싶으면 reqPost 함수를 호출한다. 
         * 단, Sync 시 복호화는 callback 에서 처리한다. 
         * 여기서는 순차적으로 진행되어야 하므로 SyncreqPostcp 함수를 사용한다.   
         * Sync Request Post
        ************************************************************/
        var resData = reqHttp.SyncreqPost(CPID,readyData);

        /**************************************************
         * 응답데이터 처리 
         * urldecode - DATA 값 획득 - 복호화 - base64decode  
        **************************************************/
        decodeCipherText = urlencode.decode(resData,'EUC-KR');
        const dataValue = decodeCipherText.split('=');
        var decryptedData = cipher.decrypt(dataValue[1]);

        //파라미터별 데이터 분리 후 UrlDecode
        var res = str2data(decryptedData);

        return res;

    } catch(error){
        console.error(error);
        return "error";
    }
}
//step 3
function doReadyRedirect(res){
    try{
        if(res["RETURNCODE"] == '0000')
        {
            console.log(res["RETURNMSG"]);
            console.log(res["STARTURL"]);
            console.log(res["TID"]);
            console.log(res["ORDERID"]);
            console.log(res["STARTPARAMS"])
            /**************************************************
            * form POST 전송 => 다날 카드 결재 화면 출력
            **************************************************/
            var html = reqHttp.SyncreqPostXfu(res["STARTURL"], "STARTPARAMS", res["STARTPARAMS"]);

            return html;
        }
        else{
            console.log(res["RETURNCODE"]);
            console.log(res["RETURNMSG"]);
            //close 
        }
    }catch(error){
        console.log(error);
        return "error";
    }
}
/**************************************************
 * danal 응답데이터를 파싱하여  key-value 배열로 리턴한다.
 **************************************************/
async function CallCredit(res, isDebug) {
  
    try {       
        //step 1
        var req_enc_data = readyData_for_request();
        
        //step 2
        var result = doReady(req_enc_data);
        if(result["RETURNCODE"] == '0000')
        {
            console.log(result["RETURNMSG"]);
            console.log(result["STARTURL"]);
            console.log(result["TID"]);
            console.log(result["ORDERID"]);
            console.log(result["STARTPARAMS"])
            
            //request form Post => UI에서 처리해야 한다. 
            //doReadyRedirect(result)
            
            //UI에서 리다이렉트 하도록 STARTURL, STARTPARAMS 값을 리턴한다.
            /**
                 <form name="form" ACTION="<%=RES_DATA.get("STARTURL")%>" METHOD="POST">
                <input TYPE="HIDDEN" NAME="STARTPARAMS" VALUE="<%=RES_DATA.get("STARTPARAMS")%>"> 
                </form>
                <script>
                document.form.submit();
                </script> 
            */
            if(!isDebug)
                return apiResponse.successResponseWithReadyParams(res,result["STARTURL"],result["STARTPARAMS"]);
        }
        else{
            console.log(result["RETURNCODE"]);
            console.log(result["RETURNMSG"]);

            if(!isDebug)
                return apiResponse.validationErrorWithData(res,"RETURNMSG",result["RETURNMSG"]);
        }
   
        //step 3
        //var result = doReadyRedirect(result);

        return result;

    } catch (error) {
      console.error(error);
    }
  } 
/**************************************************
 * Controller EXPORTS FUNC 
 **************************************************/
function DanalReady(req, res, next){
    
    var data = CallCredit(res,0);    
}
module.exports = {
    DanalReady: DanalReady,
}

//디버깅 시에 주석 해제
var data = CallCredit(0,1);
console.log(data);