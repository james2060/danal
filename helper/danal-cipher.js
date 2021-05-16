var crypto = require('crypto');

/*
    @author kisookang
    @date 2021-05-10
    @email verynicesoo78@gmail.com
    @note AES256/CBC Encryp / Decrypt => base64 encode/decode
*/

var CPID = "9810030929"; // 실서비스를 위해서는 반드시 교체필요.
// 암호화Key. 실서비스를 위해서는 반드시 교체필요.
var CRYPTOKEY = Buffer.from("20ad459ab1ad2f6e541929d50d24765abb05850094a9629041bebb726814625d", 'hex');
var IVKEY = Buffer.from("d7d02c92cb930b661f107cb92690fc83", 'hex'); // IV 고정값.

exports.getAlgorithm = function(ckey) {

    var key = ckey;
    switch (key.length) {
        case 32:
            return 'aes-128-cbc';
        case 64:
            return 'aes-256-cbc';

    }

    throw new Error('Invalid key length: ' + key.length);
};

exports.encrypt = function(plainText) {

    var key = CRYPTOKEY;//Buffer.from(keyBase64, 'base64');
    var iv = IVKEY;//Buffer.from(ivBase64, 'base64');

    var cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let cip = cipher.update(plainText, 'utf8', 'base64')
    cip += cipher.final('base64');
    return cip;
};


exports.decrypt = function  (messagebase64) {

    var key = CRYPTOKEY;//Buffer.from(keyBase64, 'base64');
    var iv = IVKEY;//Buffer.from(ivBase64, 'base64');

    var decipher = crypto.createDecipheriv('aes-256-cbc',key, iv);
    let dec = decipher.update(messagebase64, 'base64');
    dec += decipher.final('');
    return dec;
}