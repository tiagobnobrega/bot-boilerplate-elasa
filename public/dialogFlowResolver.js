var DialogFlowResolver = function(initArgs){
  var me = {};
  var flowDefinition = [],
      context = {},
      defaultContext = {"__":{"listenOnly":["intent","entities"],"lastNode":null,"lastNodes":[]}},
      replyPromise = null //lazy populated
      INTENT_CONFIDENCE_THRESHOLD = 0.5
  ;
  
  var init = function(){
    if(!initArgs) throw new Error("Argumentos de inicialização não definidos");
    flowDefinition = initArgs.flowDefinition || flowDefinition;
    parseFlowDefinition(); 
    context = initArgs.context || context;
    context = Object.assign(defaultContext,context);
  }
  
  var uuid = function(){
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
  var isObject = function(a) {
    return (!!a) && (a.constructor === Object);
  };
  var isFunction = function(object) {
   return _.isFunction(object);
  }
  var filterDuplicates = function(elem, pos,arr) {
    return arr.indexOf(elem) == pos;
  }

  var parseFlowDefinition = function(){
    flowDefinition = flowDefinition.map(setFlowRuleDefaults);
  }
  
  var setFlowRuleDefaults = function(fr){
    fr.id = (fr.id || uuid());
    fr.priority = (fr.priority || 0);
    fr.fromNode = (fr.fromNode || "*");
    fr.scoreRule = (fr.scoreRule || function(){return false});
    //fr.setListenOnly = fr.setListenOnly; default value is undefined
    return fr;
  }
  
  var convertAiResponseToScoreRule = function(aiResponse){
    let ret = {};
    let topScoringIntent;
    if(aiResponse.intents){
      console.log("aiResponse.intents:",aiResponse.intents);
       topScoringIntent= aiResponse.intents
       .filter(function(e){return e.confidence>INTENT_CONFIDENCE_THRESHOLD})
       .reduce(function(a,b){
          return (a.confidence>b.confidence?a:b)
        },{intent:null,confidence:0}); 
      ret.intent = topScoringIntent.intent;
    }
    //TODO: Neste cenário, estará sobrescrevendo entidades, 
    //      mas multiplas entidades ainda não são suportadas
    let entities = {};
    if(aiResponse.entities){
      aiResponse.entities.forEach(function(e){
        entities[e.entity] = e.value;
      })
      ret.entities = entities;
    }
    return ret;
  }
  
  var mergeMessageIntoContext = function(aiResponse){
    let aiContextToMerge = {};
    let parsedAiResponse = convertAiResponseToScoreRule(aiResponse)
    console.log("aiParsedContext:",parsedAiResponse);
    context.__.listenOnly.forEach(function(attr){
      aiContextToMerge[attr] = parsedAiResponse[attr];
    });
     
    context.intent = aiContextToMerge.intent || context.intent;
    console.log("context:",context);
    context.entities = _.merge(context.entities,aiContextToMerge.entities);
    //Object.assign({},context.entities,aiContextToMerge.entities);
  }

  var allElementsMatch = function(src,ref){
    console.log("src:",src,"ref:",ref);
    if(src==="*"){
      return (typeof ref !== "undefined" && ref !== null);
    }
    else if(src===null){
      console.log("src is null");
      return (typeof ref === "undefined" || ref === null);
    }
    
    else if(isObject(src) && isObject(ref)){
      console.log("src is object");
      for(attr in src){
        console.log("evaluate "+attr);
        let test = allElementsMatch(src[attr],ref[attr]);
        if (test === false) return false;
      }
      return true;
    }
    else{
      return src === ref;
    }
    
    return ret;
  };
      
  var filterFromNode = function(fr){
    return fr.fromNode==="*" || fr.fromNode===context.__.lastNode;
  }
      
  var isRuleApplicableForContext = function(fr){
    let ret;
    console.group();
    if(isObject(fr.scoreRule)){
      console.log("allElementsMatch("+JSON.stringify(fr.scoreRule)+","+JSON.stringify(context)+")");
      ret = allElementsMatch(fr.scoreRule,context);  
    } 
    else if(isFunction(fr.scoreRule)){
      ret = fr.scoreRule(context);
    }
    else{
      throw Error("Unsupported flow rule type in rule: "+fr.id);
    }
    console.log("evaluating rule:",fr,"result:",ret);
    console.groupEnd();
    return ret;
  }
  
  var electWinner = function(candidateRules){
    if(candidateRules.length===1) return candidateRules[0];
    let uniquePriorities = candidateRules
      .map(function(e){
        return e.priority;
      })
      .filter(filterDuplicates);
    
    if(uniquePriorities.length<=1){
      console.log(uniquePriorities)
      throw new Error("Cannot elect winner rule from candidate rules");
    }
    
    return candidateRules.reduce(function(ant,atual){
      return (ant.priority>atual.priority? ant: atual)
    })
  }

  var addLastRuleToContext = function(flowRule){
    context.__.lastNodes.unshift(flowRule.id);
    context.__.lastNodes = context.__.lastNodes.slice(0,5);
    context.__.lastNode = flowRule.id;
  }

  var getWinnerRule = function(){
    console.log('flowDefinition:',flowDefinition);
    let candidates = flowDefinition.filter(filterFromNode).filter(isRuleApplicableForContext);
    console.log('context:',context,'candidates:',candidates);
    return electWinner(candidates);
  }
  
  var applyDefineContext = function(defineContextAttr){
    if(!defineContextAttr) return;
    console.log('applyDefineContext.context:',context);
    if(isFunction(defineContextAttr)){
      context = defineContextAttr(context);
    }
    
    else if(isObject(defineContextAttr)){
      _.merge(context,defineContextAttr);
    }
    console.log('applyDefineContext.context.after:',context);
  }
  
  var applyListenTo = function(listenToAttr){
    if(!listenToAttr) return;
    if(!_.isArray(listenToAttr)){
      listenToAttr = [listenToAttr];
    }
    
    context.__.listenOnly = listenToAttr;
  }
  
  var applyRule = function(flowRule){
    if(!flowRule.action) return;
    //processar replies
    
    //processar defineContext
    applyDefineContext(flowRule.action.defineContext);
    
    //processar listenOnlyto
    applyListenTo(flowRule.action.listenTo);
  };
  
  me.applyRule = applyRule;
  
  me.getRule = function(aiResponse){
    mergeMessageIntoContext(aiResponse);
    let winner = getWinnerRule();
    addLastRuleToContext(winner);//TODO Não deve ser chamado neste metodo
    return winner;
  };
  
  me.getContext = function(){
    return Object.assign({},context);
  }
  
  init();
  return me;
}