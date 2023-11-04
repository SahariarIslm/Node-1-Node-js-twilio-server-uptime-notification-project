/*
*Title:Sample Handler
*Description:Sample Handler
*Author:Sahariar Islam
*Date:10/29/2023
*/

// module scaffolding
const handler = {};
handler.sampleHandler = (requestProperties,callback)=>{
    console.log(requestProperties);
    callback(200, {message:'This is a sample url'});
};

module.exports = handler;