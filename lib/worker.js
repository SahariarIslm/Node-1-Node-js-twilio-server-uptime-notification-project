/*
*Title:Workers Library
*Description:Worker related files
*Author:Sahariar Islam
*Date:11/03/2023
*/

// dependencies
const url = require('url');
const data = require('./data');
const http = require('http');
const https = require('https');
const {parseJSON} = require('../helpers/utilities');
const {sendTwiloSms} = require('../helpers/notification');

// app object - module scaffolding
const worker = {};

// lookup all the checks from db
worker.gatherAllChecks = ()=>{
    // get all the checks
    data.list('checks',(err1,checks)=>{
        if (!err1&&checks&&checks.length>0) {
            checks.forEach(check => {
                // read the check data 
                data.read('checks',check,(err2,originalCheckData)=>{
                    if (!err2 && originalCheckData) {
                        // pass the data to the next process
                        worker.validateCheckData(parseJSON(originalCheckData));
                    }else{
                        console.log('error:reading one of the checks data');
                    }
                });
            });
        } else {
            console.log('error:could not find any checks to process');
        }
    });
}

// validate individual Check Data

worker.validateCheckData = (originalCheckData)=>{
    let originalData = originalCheckData;
    if (originalData&&originalData.id) {
        originalData.state=typeof(originalData.state)=='string'&&['up','down'].indexOf(originalData.state)>-1?originalData.state:'down';
        originalData.lastChecked = typeof(originalData.lastChecked)=='number'&&originalData.lastChecked>0?originalData.lastChecked:false;

        // pass to the next process 
        worker.performCheck(originalData);
    } else {
        console.log('error:check was invalid or not properly formated');
    }
}
// perform check
worker.performCheck = (originalData)=>{
    // prepare the initial check outcome
    let checkOutCome = {
        'error':false,
        'responseCode':false,
    };
    // mark the outcome has not been sent yet
    let outcomeSent = false;

    // parse the hostname and full url from originalData
    let parsedUrl = url.parse(originalData.peotocol+'://'+originalData.url,true);
    const hostname = parsedUrl.hostname;
    const path = parsedUrl.path;
    // construct the request 
    const requestDetails = {
        'protocol':originalData.protocol+':',
        'hostname':hostname,
        'method':originalData.method.toUpperCase(),
        'path':path,
        'timeout':originalData.timeoutSeconds*1000,
    };

    const protocolToUse = originalData.protocol=='http'?http:https;
    let req = protocolToUse.request(requestDetails,(res)=>{
        // grab the status of the response 
        const status = res.statusCode;
        // update the check outcome and pass to the next process
        checkOutCome.responseCode = status;
        if(!outcomeSent){
            worker.processCheckOutcome(originalData,checkOutCome);
            outcomeSent = true;
        }
    });
    req.on(`error`,(e)=>{
        checkOutCome = {
            'error':true,
            'value':e,
        };
        // update the check outcome and pass to the next process
        if(!outcomeSent){
            worker.processCheckOutcome(originalData,checkOutCome);
            outcomeSent = true;
        }
    });
    req.on(`timeout`,()=>{
        checkOutCome = {
            'error':true,
            'value':'timeout',
        };
        // update the check outcome and pass to the next process
        if(!outcomeSent){
            worker.processCheckOutcome(originalData,checkOutCome);
            outcomeSent = true;
        }
    });
    // req send
    req.end();
};

worker.processCheckOutcome = (originalCheckData,checkOutCome) => {
    // check if the outcome is up or down 
    let state = !checkOutCome.error&&checkOutCome.responseCode&&originalCheckData.successCodes.indexOf(checkOutCome.responseCode)>-1?"up":"down";

    // decide whethe we should alert the user or not 
    let alertWanted = originalCheckData.lastChecked&&originalCheckData.state!=state?true:false;

    // update the check data
    let newCheckdata = originalCheckData;
    newCheckdata.state = state;
    newCheckdata.lastChecked=Date.now();

    // update the check to disk
    data.update('checks',newCheckdata.id,newCheckdata,(err)=>{
        if (!err) {
            if (alertWanted) {
                // send the check data to next process
                worker.alertUserToStatusChange(newCheckdata);
            }else{
                console.log("Alert is not needed as there is no state change");
            }
            
        }else{
            console.log('Error:Trying to save check data of one of the checks');
        }
    })
};
// send notification sms to user if state changes
worker.alertUserToStatusChange = (newCheckdata) =>{
    let message = `Alert:Your check for ${newCheckdata.method.toUpperCase()} ${newCheckdata.protocol}://${newCheckdata.url} is currently ${newCheckdata.state}`;

    sendTwiloSms(newCheckdata.userPhone,message,(err)=>{
        if (!err) {
            console.log(`user was alerted to a status change via SMS: ${message}`);
        }else{
            console.log('there was a problem sending sms to one of the user');
        }
    });
};

// timer to execute the worker process once per minute 
worker.loop = () => {
    setInterval(()=>{
        worker.gatherAllChecks();
    },5000);
}

//start the worker
worker.init=()=>{
    // execute all the checks
    worker.gatherAllChecks();

    // call the loop so that checks continue
    worker.loop(); 

}
module.exports = worker;