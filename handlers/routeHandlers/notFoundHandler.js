/*
*Title:Not Found Handler
*Description:Not Found Handler
*Author:Sahariar Islam
*Date:10/29/2023
*/

// module scaffolding
const handler = {};
handler.notFoundHandler = (requestProperties,callback)=>{
    callback(404, {
        message:'your requested url was not found!'
    });
};

module.exports = handler;