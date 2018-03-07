require('dotenv').config();
require('console-stamp')(console, { pattern: "dd/mm/yyyy HH:MM:ss", label: true });
const restify = require('restify');
const bodyParser = require('body-parser');

const axios = require('axios');

const ContextManager = require('./utils/ContextManager');
const contextManager = new ContextManager();

// Load Lais Lib
const lais = require('./lais');
const laisClient = lais.Client();

// Load Dictionary
const appDictionary = require('./utils/dictionary');
const laisDictionary = lais.Dictionary(appDictionary);

//app scripts
const scripts = require('./utils/scripts');
console.log('scripts',scripts);

// Setup Restify Server
const server = restify.createServer({ 'name': "lais-bot" });

// Setup App
(async function(){
  // restify async wrapper
  const wrapAsync = function(fn) {
    return function(req, res, next) {
      return fn(req, res, next).catch(function(err) {
        return next(err);
      });
    };
  };

  console.log('Stating raw end-point...');
  // Set Context Manager:
  const UUIDv4 = function b(a){return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,b)}

  // Load Dialogs & Rules & startUpdater
  let dialogEngine = await lais.DialogRemote({updateInterval:5, logLevel:'DEBUG'});

  // Start service
  server.post('/api/raw', [bodyParser.json(),
    wrapAsync(async (req, res)=>{
      try{
      console.log('Requisição recebida!');

      // Retrive/create context
      const {contextId:requestContextId, userId, message} = req.body;
      if(message==="_reset"){
        contextManager.clearAll();
        console.log('cleared contexts')
      }

      const contextId = requestContextId || UUIDv4();
      let context = contextManager.getContext(contextId,{userId});

      // Call laisClient. talk to get user message intents & entities
      const aiResponse = await laisClient.talk(contextId, message);

      // Use intents to get replies
      const {context:newContext, replies } = dialogEngine.resolve(context, aiResponse, message);
      if(replies.length===0) console.log('No Replies.');
      // console.log('Definindo o contexto:', contextId,newContext);

      contextManager.setContext(contextId,newContext);

      // Do some transformation.
      const prevContextObj = context.asPlainObject();
      const nextContextObj = newContext.asPlainObject();

      const returnReplies = await Promise.all(replies.map(async  reply=>{
        if(reply.type==="function"){
          const fnValue= await reply.content(prevContextObj,nextContextObj,scripts);
          reply = fnValue.reply || fnValue;
          //set context if any returns
          if(fnValue.context) contextManager.setContext(contextId, context.fromPlainObject(fnValue.context));
          console.log('Reply. Definir Contexto:',contextManager.getContext(contextId).asPlainObject());
        };

        if(reply.type ==="text"){
          // console.log('transform reply with context:',reply, prevContextObj)
          return {...reply, content:laisDictionary.resolveWithContext(reply.content,{prevCtx:prevContextObj, nextCtx:nextContextObj})};
        };
        return {...reply};
      }));

      // console.log('+++++++++++++++')
      // console.log(replies)
      // console.log(returnReplies);
      // console.log('+++++++++++++++')

      // Return response
      res.send({contextId, replies: returnReplies});
      }catch(err){
        console.error(err);
        res.send({type:'error',message: err.message, stack:err.stack});
      }
    })
  ]);

  // Setup health check
  server.get('/healthcheck', function (req, res) {
    res.send({ status: "Ok" });
  });

 server.post('/api/echo', [bodyParser.json(),
    wrapAsync(async (req, res)=>{
      const body = req.body;
      res.send(req.body);
    })
])

  console.log('Stating raw end-point done! Ready to use!');
})().catch((err)=>console.log('ERROR starting raw end-point:',err));

server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('LAIS ver %s ONLINE', lais.version);
    console.log('%s listening to %s', server.name, server.url);
});


