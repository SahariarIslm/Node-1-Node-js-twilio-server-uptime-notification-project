/*
*Title:User Handler
*Description:Route handler to handle user related routes
*Author:Sahariar Islam
*Date:10/30/2023
*/

//dependencies
const data = require('../../lib/data');
const  {hash}=require('../../helpers/utilities');
const  {parseJSON}=require('../../helpers/utilities');
const tokenHandler = require('./tokenHandler');
// module scaffolding
const handler = {};
handler.userHandler = (requestProperties,callback)=>{
    const acceptedMethods=['get','post','put','delete'];
    if(acceptedMethods.indexOf(requestProperties.method)>-1){
        handler._users[requestProperties.method](requestProperties,callback);
    }else{
        // request denied
        callback(405);
    }
    
};
handler._users={};

handler._users.post=(requestProperties,callback)=>{
    const firstName = typeof(requestProperties.body.firstName)=='string' && requestProperties.body.firstName.trim().length > 0 ? requestProperties.body.firstName:false;

    const lastName = typeof(requestProperties.body.lastName)=='string'&&requestProperties.body.lastName.trim().length> 0 ? requestProperties.body.lastName:false;

    const phone = typeof(requestProperties.body.phone)=='string'&&requestProperties.body.phone.trim().length== 11 ? requestProperties.body.phone:false;
    
    const password = typeof(requestProperties.body.password)=='string'&&requestProperties.body.password.trim().length> 0 ?requestProperties.body.password:false;
    
    const tosAgreement = typeof(requestProperties.body.tosAgreement) == 'boolean' && requestProperties.body.tosAgreement?requestProperties.body.tosAgreement:false;

    if (firstName && lastName && phone && password && tosAgreement) {
        // make sure that user doesn't exist
        data.read('users',phone,(err1)=>{
            if(err1){
                let userObject={
                    firstName,
                    lastName,
                    phone,
                    password:hash(password),
                    tosAgreement
                };
                // store the user to db
                data.create('users',phone,userObject,(err2)=>{
                    if(!err2){
                        callback(200,{
                            "message":'user was created successfully'
                        });
                    }else{
                        callback(500,{'error':'Could not create user!'});
                    }
                });
            }else{
                callback(500,{
                    error:'There was a problem is server side',
                })
            }
        });
    }else{
        callback(400,{
            error:'There was a problem in your request'
        });
    }
    
};

//@TODO; Authentication
handler._users.get=(requestProperties,callback)=>{
    // check the phone number if valid 
    const phone = typeof(requestProperties.queruStringObject.phone)=='string'&&requestProperties.queruStringObject.phone.trim().length== 11 ? requestProperties.queruStringObject.phone:false;
    if (phone) {
        // varify token
        let token = typeof(requestProperties.headersObject.token)=='string'?requestProperties.headersObject.token:false;
        tokenHandler._token.varify(token,phone,(tokenID)=>{
            if (tokenID) {
                // get the user
                data.read('users',phone,(err,u)=>{
                    const user = {...parseJSON(u)};

                    if(!err && user){
                        delete user.password;
                        callback(200,user);
                    }else{
                        callback(404,{
                            'error':'Requested user was not found!'
                        });
                    }
                });
            }else{
                callback(403,{
                    error:'Authentication Failed'
                })
            }
        })
        
    }else{
        callback(404,{
            'error':'Requested user was not found!'
        });
    }
};

//@TODO; Authentication
handler._users.put=(requestProperties,callback)=>{
    // check the phone number if valid 
    const phone = typeof(requestProperties.body.phone)=='string' && requestProperties.body.phone.trim().length== 11 ? requestProperties.body.phone:false;

    const firstName = typeof(requestProperties.body.firstName)=='string' && requestProperties.body.firstName.trim().length > 0 ? requestProperties.body.firstName:false;

    const lastName = typeof(requestProperties.body.lastName)=='string' && requestProperties.body.lastName.trim().length> 0 ? requestProperties.body.lastName:false;
    
    const password = typeof(requestProperties.body.password)=='string' && requestProperties.body.password.trim().length> 0 ? requestProperties.body.password:false;

    if (phone) {
        if (firstName||lastName||password) {
            // varify token
            let token = typeof(requestProperties.headersObject.token)=='string'?requestProperties.headersObject.token:false;
            tokenHandler._token.varify(token,phone,(tokenID)=>{
                if (tokenID) {
                    // get the user
                    data.read('users',phone,(err1,u)=>{

                        const userData = {...parseJSON(u)};
                        
                        if(!err1 && userData){
                            if(firstName){
                                userData.firstName = firstName;
                            }
                            if(lastName){
                                userData.lastName = lastName;
                            }
                            if(password){
                                userData.password = hash(password);
                            }
                            // update data
                            data.update('users',phone,userData,(err2)=>{
                                if (!err2) {
                                    callback(200,{
                                        'message':'user was updated successfully!'
                                    });
                                }else{
                                    callback(500,{
                                        'Error':'there was a problem in server side'
                                    });
                                }
                            })
                        }else{
                            
                            callback(400,{
                                'Error':'Invalid phone number. Please try again!'
                            });
                        }
                    });
                }else{
                    callback(403,{
                        error:'Authentication Failed'
                    })
                }
            })
            
        }else{
            callback(400,{
                'Error':'You have a problem in your request'
            });
        }
    }else{
        callback(400,{
            'Error':'Invalid phone number, Please try again'
        });
    }

};

//@TODO; Authentication
handler._users.delete=(requestProperties,callback)=>{
    const phone = typeof(requestProperties.queruStringObject.phone)=='string' && requestProperties.queruStringObject.phone.trim().length== 11 ? requestProperties.queruStringObject.phone:false;

    if (phone) {
        // varify token
        let token = typeof(requestProperties.headersObject.token)=='string'?requestProperties.headersObject.token:false;
        tokenHandler._token.varify(token,phone,(tokenID)=>{
            if (tokenID) {
                // look for user
                data.read('users',phone,(err,userData)=>{
                    if (!err&&userData) {
                        data.delete('users',phone,(err2)=>{
                            if (!err2) {
                                callback(200,{
                                    'message':'User was deleted successfully'
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
                });
            }else{
                callback(403,{
                    error:'Authentication Failed'
                })
            }
        })
        
    }else{
        callback(400,{
            'Error':'You have a problem in your request'
        });
    }
};

module.exports = handler;