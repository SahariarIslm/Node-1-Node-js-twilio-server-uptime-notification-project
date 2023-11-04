/*
*Title:Uptime monitoring application
*Description:A RESTFUL API to monitor up or downtime of user links
*Author:Sahariar Islam
*Date:10/28/2023
*/

// dependencies

const server=require('./lib/server');
const workers=require('./lib/worker');

// app object - module scaffolding
const app = {};

app.init = ()=>{
    // start the server
    server.init();
    // start the worker
    workers.init();
}

app.init()
module.exports=app;