/*
*Title:Handle Request Response
*Description:Handle Request and Response
*Author:Sahariar Islam
*Date:10/28/2023
*/

// dependencies
const url = require('url');
const {StringDecoder} = require('string_decoder');
const routes = require('../routes');
const {notFoundHandler} = require('../handlers/routeHandlers/notFoundHandler');
const {parseJSON} = require('../helpers/utilities')
// module scaffolding
const handler= {};
handler.handleReqRes = (req,res)=>{
    // request handling
    // get the url and parse it
    const parsedUrl=url.parse(req.url,true);
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g,'');
    const method = req.method.toLowerCase();
    const queruStringObject = parsedUrl.query;
    const headersObject = req.headers;

    const requestProperties = {
        parsedUrl,
        path,
        trimmedPath,
        method,
        queruStringObject,
        headersObject
    };
    
    const decoder = new StringDecoder('utf8');
    let realData = '';
    const chosenHandler = routes[trimmedPath]?routes[trimmedPath]:notFoundHandler;
    
    req.on('data',(buffer)=>{
        realData+=decoder.write(buffer);
    });

    req.on('end',(buffer)=>{
        realData += decoder.end();

        requestProperties.body = parseJSON(realData);
        chosenHandler(requestProperties, (statusCode, payload)=>{
            statusCode= typeof(statusCode)==='number'?statusCode:500;
            payload= typeof(payload)==='object'?payload:{};
    
            const payloadString=JSON.stringify(payload);
    
            // return the final response
            res.setHeader('Content-Type','application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
        });
    });
};
module.exports = handler;