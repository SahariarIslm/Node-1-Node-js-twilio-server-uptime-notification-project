/*
*Title:Token Handler
*Description:Route handler to handle Token related routes
*Author:Sahariar Islam
*Date:11/01/2023
*/

//dependencies
const data = require('../../lib/data');
const  {hash}=require('../../helpers/utilities');
const  {createRandomString}=require('../../helpers/utilities');
const  {parseJSON}=require('../../helpers/utilities');
// module scaffolding
const handler = {};
handler.tokenHandler = (requestProperties,callback)=>{
    const acceptedMethods=['get','post','put','delete'];
    if(acceptedMethods.indexOf(requestProperties.method)>-1){
        handler._token[requestProperties.method](requestProperties,callback);
    }else{
        // request denied
        callback(405);
    }
};
handler._token={};

handler._token.post=(requestProperties,callback)=>{
    const phone = typeof(requestProperties.body.phone)=='string'&&requestProperties.body.phone.trim().length== 11 ? requestProperties.body.phone:false;
    
    const password = typeof(requestProperties.body.password)=='string'&&requestProperties.body.password.trim().length> 0 ?requestProperties.body.password:false;
    
    if (phone&&password) {
        data.read('users',phone,(err1,userData)=>{
            let hashedPassword = hash(password);
            if (hashedPassword === parseJSON(userData).password) {
                let tokenID = createRandomString(20);
                let expires = Date.now()+60*60*1000;
                let tokenObject = {
                    phone,
                    'id':tokenID,
                    expires
                };

                // store the token
                data.create('tokens',tokenID,tokenObject,(err2)=>{
                    if (!err2) {
                        callback(200,tokenObject);
                    }else{
                        callback(500,{
                            error:"There was a proble in the serverside"
                        });
                    }
                });
            }else{
                callback(400,{
                    error:'Password is not valid'
                });
            }
        });
    }else{
        callback(400,{
            error:'You have a problem in your request'
        });
    }
};

handler._token.get=(requestProperties,callback)=>{
    // check the tokenID number if valid 
    const id = typeof(requestProperties.queruStringObject.id)=='string'&&requestProperties.queruStringObject.id.trim().length== 20 ? requestProperties.queruStringObject.id:false;
    if (id) {
        // get the token
        data.read('tokens',id,(err,tokenData)=>{
            const token = {...parseJSON(tokenData)};

            if(!err && token){
                callback(200,token);
            }else{
                callback(404,{
                    'error':'Requested token was not found!'
                });
            }
        });
    }else{
        callback(404,{
            'error':'Requested token was not found!'
        });
    }
};

//@todo Authentication
handler._token.put=(requestProperties,callback)=>{
    const id = typeof(requestProperties.body.id)=='string'&&requestProperties.body.id.trim().length== 20 ? requestProperties.body.id:false;
    const extend = typeof(requestProperties.body.extend)=='boolean'&&requestProperties.body.extend== true ? true:false;

    if(id && extend){
        data.read('tokens',id,(err1, tokenData)=>{
            const tokenObject = parseJSON(tokenData);
            if (tokenObject.expires > Date.now()) {
                tokenObject.expires = Date.now()+60*60*1000;
                // store the updated token 
                data.update('tokens',id,tokenObject,(err2)=>{
                    if (!err2) {
                        callback(200);
                    }else{
                        callback(500,{
                            'error':'There was a server side error!',
                        });
                    }
                });
            }else{
                callback(400,{
                    'error':'Token already expired!',
                }); 
            }
        });
    }else{
        callback(400,{
            'error':'There was a problem in your request!'
        });
    }
};
//@todo Authentication
handler._token.delete=(requestProperties,callback)=>{
    // check if the Token is valid
    const id = typeof(requestProperties.queruStringObject.id)== 'string' && requestProperties.queruStringObject.id.trim().length == 20 ? requestProperties.queruStringObject.id:false;

    if (id) {
        // look for user
        data.read('tokens',id,(err,tokenData)=>{
            if (!err&&tokenData) {
                data.delete('tokens',id,(err2)=>{
                    if (!err2) {
                        callback(200,{
                            'message':'Token was deleted successfully!'
                        });
                    }else{
                        callback(500,{
                            'Error':'there was a problem in server side'
                        });
                    }
                })
            }else{
                callback(500,{
                    'Error':'there was a problem in server side'
                });
            }
        })
    }else{
        callback(400,{
            'Error':'You have a problem in your request'
        });
    }
};

handler._token.varify=(id,phone,callback)=>{
    data.read('tokens',id,(err,tokenData)=>{
        if (!err && tokenData) {
            if (parseJSON(tokenData).phone==phone&&parseJSON(tokenData).expires>Date.now()) {
                callback(true);
            }else{
                callback(false);
            }
        } else {
            callback(false);
        }
    })

    
}
module.exports = handler;