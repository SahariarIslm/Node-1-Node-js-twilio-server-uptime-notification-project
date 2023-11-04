/*
*Title:Notifications library 
*Description:Important function to notify users
*Author:Sahariar Islam
*Date:10/28/2023
*/
// dependencies
const https = require('https');
const querystring = require('querystring');
const {twilio} = require('./environments');
const client = require('twilio')(twilio.accountSid, twilio.authToken);


// module schafolding
const notifications = {};

// send sms to user using twilo API
notifications.sendTwiloSms = (phone,msg,callback)=>{
    // input validation
    const userPhone = typeof(phone) == 'string' && phone.trim().length == 11 ? phone.trim() : false;
    const userMsg = typeof(msg)=='string'&& msg.trim().length>0 && msg.trim().length<=1600?msg.trim():false;

    if (userPhone && userMsg) {
        // configure the request payload 
        const payload = {
            From:twilio.fromPhone,
            To:`+88${userPhone}`,
            Body:userMsg,
        };
        // stringify the payload
        const stringifyPayload =  querystring.stringify(payload);

        // //configure the request details
        // client.messages.create({
        //     to:'+8801909642730',
        //     from:'+12568418470',
        //     body:'ahoy hoy! Testing Twilio and node.js'
        // }, function(error, message) {
            
        //     if (!error) {
                
        //         console.log('Success! The SID for this SMS message is:');
        //         console.log(message.sid);
        //         console.log(message.statusCode);
        
        //         console.log('Message sent on:');
        //         console.log(message.dateCreated);
        //     } else {
        //         console.log('Oops! There was an error.');
        //     }
        // });

        // configure the request details
        const requestDetails = {
            hostname: 'api.twilio.com',
            method: 'POST',
            path: `/2010-04-01/Accounts/${twilio.accountSid}/Messages.json`,
            auth: `${twilio.accountSid}:${twilio.authToken}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        };

        // instantiate the request object
        const req = https.request(requestDetails, (res) => {
            // get the status of the sent request
            const status = res.statusCode;
            // callback successfully if the request went through
            if (status === 200 || status === 201) {
                callback(false);
            } else {
                callback(`Status code returned was ${status}`);
            }
        });

        req.on('error', (e) => {
            callback(e);
        });

        req.write(stringifyPayload);
        req.end();
    
    }else{
        callback('Given parameters where missing or invalid!');
    }
};

// export the module
module.exports = notifications;