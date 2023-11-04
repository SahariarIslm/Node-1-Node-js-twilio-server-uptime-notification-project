/*
*Title:Utilities
*Description:Important utility finctions
*Author:Sahariar Islam
*Date:10/30/2023
*/

// dependencies
const crypto = require('crypto');
const environments=require('./environments');
//module scaffolding
const utilities = {};

// parse JSON string to object
utilities.parseJSON=(jsonString)=>{
    let output;

    try{
        output = JSON.parse(jsonString);
    }catch{
        output = {};
    }

    return output;
}

// hash string
utilities.hash = (str) =>{
    if(typeof(str)=='string'&&str.length>0){
        const hash = crypto
                    .createHmac('sha256',environments.secretKey)
                    .update(str)
                    .digest('hex');
        return hash;
    }else{
        return false;
    }
}

// create random string
utilities.createRandomString = (strlength) =>{
    let length = strlength;
    length=typeof(strlength)=='number'&&strlength>0?strlength:false;

    if (length) {
        let possibleCharacters='abcdefghijklmnopqrstuvwxyz1234567890';
        let output='';
        for (let i = 0; i < length; i++) {
            let randomcharacter = possibleCharacters.charAt(Math.floor(Math.random()*possibleCharacters.length));
            output+=randomcharacter;
        }
        return output;
    }else{
        return false;
    }
}

//export module
module.exports = utilities;