$(function(){
  let regras = buildDefaultRules();
  let dialogResolver = DialogFlowResolver({'flowDefinition':regras});
  let context = {}
  let defaultAiResponse = {"entities": [],
    "intents": [
      {
        "confidence": 1,
        "intent": "saudacao"
      }
    ]}
  
  /*
  let cmCodeFolding = {
    mode: "javascript",
    lineNumbers: true,
    lineWrapping: true,
    extraKeys: {"Ctrl-Q": function(cm){ cm.foldCode(cm.getCursor()); }},
    foldGutter: true,
    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
  }*/
 let cmConfig = {
    mode: "application/json",
    theme:"xq-light",
    styleActiveLine: true,
    lineNumbers: true,
    lineWrapping: true,
    extraKeys: {"Ctrl-Q": function(cm){ cm.foldCode(cm.getCursor()); }},
    foldGutter: true,
    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
    matchBrackets: true,
    autoCloseBrackets: true,
    viewportMargin: Infinity
  }
  
  let cmReadOnly = { 
    mode: "application/json",
    theme:"xq-light",
    lineNumbers: true,
    lineWrapping: true,
    matchBrackets: true,
    readOnly:true
  }
  
  
  console.log("ctx:",dialogResolver.getContext());
  
  //construir codemirror
  let cmRegras = CodeMirror.fromTextArea($('#campo-regras')[0],cmConfig);
  let cmContexto = CodeMirror.fromTextArea($('#campo-contexto')[0],cmConfig);
  let cmAi = CodeMirror.fromTextArea($('#campo-ai-response')[0],cmConfig);
  let cmRetorno = CodeMirror.fromTextArea($('#campo-retorno')[0],cmReadOnly);
  
  
  //popular valores iniciais dos campos
  cmRegras.setValue(JSON.stringify(regras,null,2));
  cmContexto.setValue(JSON.stringify(dialogResolver.getContext(),null,2));
  cmAi.setValue(JSON.stringify(defaultAiResponse,null,2));
  
  // bind evento alteração de regas
  $('#update-regras').on('click',function(){
    let txtRegras = cmRegras.getValue();
    let novasRegras;
    let contexto;
    try{
      novasRegras = JSON.parse(txtRegras);
    }catch(e){
      toastr.error('Erro ao atualizar regras:'+e.message)
      return;
    }
    regras = novasRegras
    dialogResolver = new DialogFlowResolver({'flowDefinition':regras,'context':dialogResolver.getContext()});
    toastr.info('Regras atualizadas!')
  });
  
  // bind evento alteração de contexto
  $('#update-contexto').on('click',function(){
    let txtContexto = cmContexto.getValue();
    let novoContexto;
    try{
      novoContexto = JSON.parse(txtContexto);  
    }catch(e){
      toastr.error('Erro ao atualizar contexto:'+e.message)
      return;
    }
    context = novoContexto;
    dialogResolver = new DialogFlowResolver({'flowDefinition':regras,'context':context});
    toastr.info('Contexto atualizado!')
  });
  
  
  // bind evento para processar AI response
  $('#update-ai-response').on('click',function(){
    let txtAiResp = cmAi.getValue();
    let aiResponse;
    try{
      aiResponse = JSON.parse(txtAiResp);  
    }catch(e){
      toastr.error('Erro ao processar ai response:'+e.message)
      return;
    }
    
    let winnerRule = dialogResolver.getRule(aiResponse);
    //atualizar retorno
    cmRetorno.setValue(JSON.stringify(winnerRule,null,2));
    //applicar regra
    dialogResolver.applyRule(winnerRule);
    //atualizar campo contexto
    cmContexto.setValue(JSON.stringify(dialogResolver.getContext(),null,2));
    
    toastr.info('Resposta processada')
  });
  
  
  
})
