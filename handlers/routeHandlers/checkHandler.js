/*
*Title:Check Handler
*Description:Route handler to handle user defined checks
*Author:Sahariar Islam
*Date:11/01/2023
*/

//dependencies
const data = require('../../lib/data');
const  {hash}=require('../../helpers/utilities');
const  {parseJSON,createRandomString}=require('../../helpers/utilities');
const  {maxChecks}=require('../../helpers/environments');
const tokenHandler = require('./tokenHandler');

// module scaffolding
const handler = {};
handler.checkHandler = (requestProperties,callback)=>{
    const acceptedMethods=['get','post','put','delete'];
    if(acceptedMethods.indexOf(requestProperties.method)>-1){
        handler._check[requestProperties.method](requestProperties,callback);
    }else{
        // request denied
        callback(405);
    }
};
handler._check={};

handler._check.post=(requestProperties,callback)=>{
    
    // validate inputes
    let protocol = typeof(requestProperties.body.protocol) == 'string' && ['http','https'].indexOf(requestProperties.body.protocol) > -1 ? requestProperties.body.protocol:false;

    let url = typeof(requestProperties.body.url) == 'string' && requestProperties.body.url.trim().length > 0 ? requestProperties.body.url:false;

    let method = typeof(requestProperties.body.method) =='string' && ['GET','POST','PUT','DELETE'].indexOf(requestProperties.body.method)>-1 ? requestProperties.body.method:false;

    let successCodes = typeof(requestProperties.body.successCodes) == 'object' && requestProperties.body.successCodes instanceof Array ? requestProperties.body.successCodes:false;

    let timeoutSeconds = typeof(requestProperties.body.timeoutSeconds) == 'number' && requestProperties.body.timeoutSeconds%1===0 && requestProperties.body.timeoutSeconds <= 5 ? requestProperties.body.timeoutSeconds:false;

    if(protocol && url && method && successCodes && timeoutSeconds){
        // varify token
        let token = typeof(requestProperties.headersObject.token)=='string'?requestProperties.headersObject.token:false;
        // loog up the user phone by reading the token 
        data.read('tokens',token,(err1,tokenData)=>{
            if (!err1&&tokenData) {
                let userPhone = parseJSON(tokenData).phone;
                // loolup the user data
                data.read('users',userPhone,(err2,userData)=>{
                    if (!err2 && userData) {
                        tokenHandler._token.varify(token,userPhone,(tokenIsValid)=>{
                            if (tokenIsValid) {
                                let userObject = parseJSON(userData);
                                let userChecks = typeof(userObject.checks)=='object'&& userObject.checks instanceof Array ? userObject.checks : [];
                                if (userChecks.length < maxChecks) {
                                    let checkId = createRandomString(20);
                                    let chekObject = {
                                        'id':checkId,
                                        'userPhone':userPhone,
                                        'protocol':protocol,
                                        'url':url,
                                        'method':method,
                                        'successCodes':successCodes,
                                        'timeoutSeconds':timeoutSeconds,
                                    }
                                    // save the object
                                    data.create('checks',checkId,chekObject,(err3)=> {
                                        if (!err3) {
                                           // add checkId to the users object
                                           userObject.checks = userChecks;
                                           userObject.checks.push(checkId);

                                            //save the new user data
                                            data.update('users',userPhone,userObject,(err4)=>{
                                                if (!err4) {
                                                    callback(200,chekObject);
                                                }else{
                                                    callback(500,{
                                                        error:'User already has max checks limit!'
                                                    });
                                                }
                                            })    
                                        }else{
                                            callback(500,{
                                                error:'User already has max checks limit!'
                                            });
                                        }
                                    });
                                } else {
                                    callback(401,{
                                        error:'User already has max checks limit!'
                                    });
                                }
                            }else{
                                callback(403,{
                                    error:'authentication problem'
                                });
                            }
                        });
                    }else{
                        callback(403,{
                            error:'authentication problem. User not found!'
                        });
                    }
                });
            }else{
                callback(403,{
                    error:'authentication problem'
                });
            }
        });
        
    }else{
        callback(400,{
            error:'There was a problem in your request'
        });
    }
};


handler._check.get=(requestProperties,callback)=>{
    // check the tokenID number if valid 
    const id = typeof(requestProperties.queruStringObject.id)=='string'&&requestProperties.queruStringObject.id.trim().length== 20 ? requestProperties.queruStringObject.id:false;
    if (id) {
        // lookup the check
        data.read('checks',id,(err,checkData)=>{
            if (!err && checkData) {
                // varify token
                let token = typeof(requestProperties.headersObject.token)=='string'?requestProperties.headersObject.token:false;
                tokenHandler._token.varify(token,parseJSON(checkData).userPhone,(tokenIsValid)=>{
                    if (tokenIsValid) {
                        callback(200,parseJSON(checkData));
                    }else{
                        callback(403,{
                            'error':'Authentication failed!'
                        });
                    }
                });
                
            } else {
                callback(500,{
                    'error':'You have a problem in your request!'
                });
            }
        })
       
    }else{
        callback(400,{
            'error':'You have a problem in your request!'
        });
    }
};


handler._check.put=(requestProperties,callback)=>{
    
    let id = typeof(requestProperties.body.id) == 'string' && requestProperties.body.id.trim().length== 20  ? requestProperties.body.id:false;

    // validate inputes 
    let protocol = typeof(requestProperties.body.protocol) == 'string' && ['http','https'].indexOf(requestProperties.body.protocol) > -1 ? requestProperties.body.protocol:false;

    let url = typeof(requestProperties.body.url) == 'string' && requestProperties.body.url.trim().length > 0 ? requestProperties.body.url:false;

    let method = typeof(requestProperties.body.method) =='string' && ['GET','POST','PUT','DELETE'].indexOf(requestProperties.body.method)>-1 ? requestProperties.body.method:false;

    let successCodes = typeof(requestProperties.body.successCodes) == 'object' && requestProperties.body.successCodes instanceof Array ? requestProperties.body.successCodes:false;

    let timeoutSeconds = typeof(requestProperties.body.timeoutSeconds) == 'number' && requestProperties.body.timeoutSeconds%1===0 && requestProperties.body.timeoutSeconds <= 5 ? requestProperties.body.timeoutSeconds:false;


    if (id) {
        if (protocol||url||method||successCodes||timeoutSeconds) {
            data.read('checks',id,(err1,checkData)=>{
                if (!err1&&checkData) {
                    let checkObject = parseJSON(checkData);
                    // varify token
                    let token = typeof(requestProperties.headersObject.token)=='string'?requestProperties.headersObject.token:false;
                    tokenHandler._token.varify(token,checkObject.userPhone,(tokenIsValid)=>{
                        if (tokenIsValid) {
                            if (protocol) {
                                checkObject.protocol = protocol;
                            }
                            if (url) {
                                checkObject.url = url;
                            }
                            if (method) {
                                checkObject.method = method;
                            }
                            if (successCodes) {
                                checkObject.successCodes = successCodes;
                            }
                            if (timeoutSeconds) {
                                checkObject.timeoutSeconds = timeoutSeconds;
                            }
                            // set the checkObject
                            data.update('checks',id,checkObject,(err2)=>{
                                if (!err2) {
                                    callback(200);
                                }else{
                                    callback(500,{
                                        error:'there was a serverside error'
                                    });
                                }
                            })
                        }else{
                            callback(403,{
                                error:'authentication problem'
                            });
                        }
                    });
                } else {
                    callback(500,{
                        'error':'There was a problem in the server side!'
                    });
                }
            })
        }else{
            callback(400,{
                'error':'You must provide atleast one field for update!'
            });
        }
    }else{
        callback(400,{
            'error':'You have a problem in your request!'
        });
    }
};


handler._check.delete=(requestProperties,callback)=>{
    // check the tokenID number if valid 
    const id = typeof(requestProperties.queruStringObject.id)=='string'&&requestProperties.queruStringObject.id.trim().length== 20 ? requestProperties.queruStringObject.id:false;
    if (id) {
        // lookup the check
        data.read('checks',id,(err1,checkData)=>{
            if (!err1 && checkData) {
                // varify token
                let token = typeof(requestProperties.headersObject.token)=='string'?requestProperties.headersObject.token:false;
                tokenHandler._token.varify(token,parseJSON(checkData).userPhone,(tokenIsValid)=>{
                    if (tokenIsValid) {
                        // delete the Check Data
                        data.delete('checks',id,(err2)=>{
                            if (err2) {
                                data.read('users',parseJSON(checkData).userPhone,(err3,userData)=>{
                                    if (!err3&&userData) {
                                        let userObject = parseJSON(userData);
                                        let userChecks = typeof(userObject.checks)==object && userObject.checks instanceof Array?userObject.checks:[];
                                        // remove the deleted check id from users list of checks
                                        let checkPosition = userChecks.indexOf(id);
                                        if (checkPosition>-1) {
                                            userChecks.splice(checkPosition);
                                            // resave the uder data 
                                            userObject.checks = userChecks
                                            data.update('users',userObject.phone,userObject,(err4)=>{
                                                if (!err4) {
                                                    callback(200);
                                                }else{
                                                    callback(500,{
                                                        'error':'There was a serverside error!'
                                                    });
                                                }
                                            });
                                        }else{
                                            callback(500,{
                                                'error':'The check id that you are trying to remove is not available!'
                                            });
                                        }
                                    }else{
                                        callback(500,{
                                            'error':'There was a serverside error!'
                                        });
                                    }
                                });
                            } else {
                                callback(500,{
                                    'error':'There was a serverside error!'
                                });
                            }
                        });
                    }else{
                        callback(403,{
                            'error':'Authentication failed!'
                        });
                    }
                });
            } else {
                callback(500,{
                    'error':'You have a problem in your request!'
                });
            }
        })
       
    }else{
        callback(400,{
            'error':'You have a problem in your request!'
        });
    }
};

module.exports = handler;