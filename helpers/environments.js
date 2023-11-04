/*
*Title:Environments
*Description:Handle All Environment Related Things
*Author:Sahariar Islam
*Date:10/30/2023
*/

// dependencies

//module scaffolding
const environments = {};
environments.staging={
    port:3000,
    envName:'staging',
    secretKey:'fasdgfasdg',
    maxChecks:5,
    twilio:{
        fromPhone:'+12568418470',
        accountSid:'ACbf260682f8b24ab276fc34b3600d3646',
        authToken:"fa1c7fb34bacadc9f5c4839525317845"
    }
}
environments.production={
    port:5000,
    envName:'production',
    secretKey:'asfgdadfg',
    maxChecks:5,
    twilio:{
        fromPhone:'+12568418470',
        accountSid:'ACbf260682f8b24ab276fc34b3600d3646',
        authToken:"fa1c7fb34bacadc9f5c4839525317845"
    }
}

// determine which environment was passed
const currentEnvironment = typeof(process.env.NODE_ENV)=='string'?process.env.NODE_ENV:'staging';

//export corresponding environment object
const environmentToExport = typeof(environments[currentEnvironment])=='object'?environments[currentEnvironment]:environments.staging;

//export module
module.exports = environmentToExport;