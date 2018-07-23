require('dotenv').config();
require('console-stamp')(console, {pattern: "dd/mm/yyyy HH:MM:ss", label: true});

// --- restify --- //
const restify = require('restify');
const bodyParser = require('body-parser');

//enable CORS
const corsMiddleware = require('restify-cors-middleware');

const CORS_ORIGIN=process.env.CORS_ORIGIN && process.env.CORS_ORIGIN.split(";");
const cors = corsMiddleware({
    // preflightMaxAge: 5, //Optional
    origins: CORS_ORIGIN || ['*'],
    // allowHeaders: ['API-Token'],
    // exposeHeaders: ['API-Token-Expiry']
})

const chalk = require('chalk');
const startChalk = chalk.green;


//#inject ssl root certificates for elasa API calls
//TODO not working, should also manually add chain certificates

const loadRootCertificates = () => {
    const rootCas = require('ssl-root-cas/latest').create();
    require('https').globalAgent.options.ca = rootCas;

    const restify = require('restify');
    const bodyParser = require('body-parser');

    //enable CORS
    const corsMiddleware = require('restify-cors-middleware');

    const CORS_ORIGIN = process.env.CORS_ORIGIN && process.env.CORS_ORIGIN.split(";");
    const cors = corsMiddleware({
        // preflightMaxAge: 5, //Optional
        origins: CORS_ORIGIN || ['*'],
        // allowHeaders: ['API-Token'],
        // exposeHeaders: ['API-Token-Expiry']
    })
};
loadRootCertificates();

const axios = require('axios');

const ContextManager = require('./utils/ContextManager');
const contextManager = new ContextManager();

// Load Lais Lib
const lais = require('./lais');
const laisClient = lais.Client();
let dialogEngine;//define dialogEngine var

// Load Dictionary
const appDictionary = require('./utils/dictionary');
const laisDictionary = lais.Dictionary(appDictionary);

//app scripts
const scripts = require('./utils/scripts');
// console.log('scripts',scripts);


// Setup Restify Server
const server = restify.createServer({'name': "lais-bot"});

// ---- Utils ---- //
// restify async wrapper
const wrapAsync = function (fn) {
    return function (req, res, next) {
        return fn(req, res, next).catch(function (err) {
            return next(err);
        });
    };
};

const UUIDv4 = function b(a) {
    return a ? (a ^ Math.random() * 16 >> a / 4).toString(16) : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, b)
};

const MESSAGE_TYPES = {TEXT: 'text', FILE: 'file'};

const getMessageData = reqBody => {
    let text, data;
    text = '';
    data = null;
    const {type, payload} = reqBody;

    if (type === MESSAGE_TYPES.TEXT) {
        text = payload;
    } else if (type === MESSAGE_TYPES.FILE) {
        text = '@@FILE@@';
        data = payload;
    }
    return {text, data};
};

const chatMessagePost = async (req, res) => {
    try {
        // Retrive/create context
        const {contextId: requestContextId, userId, message, type} = req.body;
        if (handleReset(message)) return;

        const contextId = requestContextId || UUIDv4();
        let context = contextManager.getContext(contextId, {userId});
        context.userId = userId;

        const {text: messageText, data: messageData} = getMessageData(req.body);


        let aiResponse = {intents:[], entities:[]};//TODO validar se não precisa ter atributo intents e entities vazios
        if (messageText) {
            // Call laisClient. talk to get user message intents & entities
            aiResponse = await laisClient.talk(contextId, messageText);
        };

        context.userInputType = type;
        context.userInputData = messageData;

        console.log()
        // Use intents to get replies
        const {context: newContext, replies} = dialogEngine.resolve(context, aiResponse, messageText);
        if (replies.length === 0) console.log('No Replies.');

        contextManager.setContext(contextId, newContext);

        // Do some transformation.
        const prevContextObj = context.asPlainObject();
        const nextContextObj = newContext.asPlainObject();

        const returnReplies = await getReturnReplies(replies, prevContextObj, nextContextObj, scripts, contextId, context);

        res.send({contextId, replies: returnReplies});
    } catch (err) {
        console.error(err);
        res.send({type: 'error', message: err.message, stack: err.stack});
    }
};

const getReturnReplies = async (replies, prevContextObj, nextContextObj,scripts, contextId, context) => {
    return Promise.all(replies.map(async reply => {
        if (reply.type === "function") {
            const fnValue = await reply.content(prevContextObj, nextContextObj, scripts);
            reply = fnValue.reply || fnValue;
            //set context if any returns
            if (fnValue.context) contextManager.setContext(contextId, context.fromPlainObject(fnValue.context));
            console.log('Reply. Definir Contexto:', contextManager.getContext(contextId).asPlainObject());
        }
        ;

        if (reply.type === "text") {
            // console.log('transform reply with context:',reply, prevContextObj)
            return {
                ...reply,
                content: laisDictionary.resolveWithContext(reply.content, {
                    prevCtx: prevContextObj,
                    nextCtx: nextContextObj
                })
            };
        }
        ;
        return {...reply};
    }));
};

const handleReset = (message) => {
    if (message === "_reset") {
        contextManager.clearAll();
        console.log('cleared contexts')
        return true;
    }
};


const setupServer = async server => {
    try{
    console.log(startChalk('Configuring CORS...'));
    server.pre(cors.preflight);
    server.use(cors.actual);

    console.log(startChalk('Loading awesome LAIS Dialog...'));
    // Load Dialogs & Rules & startUpdater
    dialogEngine = await lais.DialogRemote({updateInterval: 5, logLevel: 'TRACE'});

    console.log(startChalk('Configuring chat message post handler... '));
    server.post('/api/raw', [bodyParser.json(), wrapAsync(chatMessagePost)]);
    server.get('/healthcheck', function (req, res) {
        res.send({status: "Ok"});
    });

    console.log(startChalk('Server configured. Ready to use!'))
    }catch (e) {
        console.error("Error on server setup",e);
    }
};
setupServer(server);


server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('LAIS ver %s ONLINE', lais.version);
    console.log('%s listening to %s', server.name, server.url);
});


