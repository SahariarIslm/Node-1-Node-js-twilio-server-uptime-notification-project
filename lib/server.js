/*
*Title:Server Library
*Description:Server related files
*Author:Sahariar Islam
*Date:11/03/2023
*/

// dependencies
const http = require('http');
const{handleReqRes}=require('../helpers/handleReqRes');
const environment = require('../helpers/environments');

// app object - module scaffolding
const server = {};

// create server
server.createServer = ()=>{
    const createServerVariable = http.createServer(server.handleReqRes);
    createServerVariable.listen(environment.port,()=>{
        console.log(`Listening to port number ${environment.port}`);
    });
};

//handle Request Response
server.handleReqRes = handleReqRes;

//start the server
server.init=()=>{
    server.createServer();
}
module.exports = server;