const axios = require('axios');
const _ = require('lodash');

const wait= ms => new Promise(resolve => setTimeout(resolve, ms));
const getCurrency = (userInput)=>{
  // return userInput.match(/[+-]?[0-9]{1,3}(?:[0-9]*(?:[.,][0-9]{2})?|(?:,[0-9]{3})*(?:\.[0-9]{2})?|(?:\.[0-9]{3})*(?:,[0-9]{2})?)/)[0];
  return userInput.match(/[+-]?[0-9]{1,3}(?:\.?[0-9]{3})*[,][0-9]{2}/);
}
const handleDadosMudarPreco= async(contextArg={},nextDialogIdOnSuccess)=>{
  let replyMessage = "";
  let context = {...contextArg};
  const {userId,userMessage} = context;

  const nextDialogOnSuccess = {
    id: nextDialogIdOnSuccess,
    minConfidence: 0.6,
    listenTo: [ 'intents', 'entities' ]
   };

  let valor = context.mudar_preco_valor;
  let mudarPrecoItems = context.mudar_preco_sap;

  if(!valor){
  valor = getCurrency(userMessage);
  }

  if(!valor){
    replyMessage+="Informe por favor o valor do novo preço.";
  }else{
    context.mudar_preco_valor = valor;
  }

  if(!mudarPrecoItems){
    const {user} = await getUserElasa(userId);
    const departamentos = getUserDepartments(user);
    mudarPrecoItems = await checkItem(userMessage,departamentos);
  }
  const {status,items,codSap} = mudarPrecoItems;

  if(status==='0'){
    replyMessage+="Preciso saber o código SAP do item.";
  }
  if(status==='1'){
    replyMessage+=`O código SAP "${parseInt(codSap)}" é inválido. Tente informar novamente`;
  }

  if(status==='99'){
    replyMessage="Ocorreu um erro inesperado. Tente novamento ou consulte o administrador do sistema."
    context = {};
  }
  if(status==='2'){
    replyMessage="Seu usuário não tem acesso para alterar este item. Estou aqui se precisar de mais alguma coisa";
    context = {};
  }
  if(status==='3'){
    if(valor){
      replyMessage=`Ok. Deseja alterar o valor do item "${items[0].description}" (${parseInt(codSap)}) para ${valor} ?`;
      context.mudar_preco_sap = codSap;
      context._dialog = nextDialogOnSuccess;
    }
  }
  return {context,reply:{type:"text",content:replyMessage}};
};

const checkItem= async (userInput,departamentos)=>{
  let retorno;

  //identificar codSAP
  let codSapArray = userInput.match(/\b[\d]{6,}\b/);

  //completar com zeros a esquerda ate ficar com 18 char
  let codSap = codSapArray && codSapArray[0].padStart(18, '0');

  // Não foi identificado nenhum codigo sap
  if (codSap === null || codSap === undefined) {
    return {status: '0', items: [], codSap};
  }

  try {

    //chamar serviço com codSAP
    const response = await axios.post('http://hmlpromocao.lasa.lojasamericanas.com.br/v1/item',{query: codSap}, {headers: {'Content-Type': 'application/json','Authorization': 'Bearer 58efdaf75b921528b09283e4'}});

    retorno = response.data.result;

    // Serviço retornou vazio
    if (response.data === null || response.data.length === 0 || response.data.result.length === 0) {
      retorno = {status:'1',items: [], codSap};
      // console.log('response done',response.data);
      return retorno;
    }

    //filtrar da lista de itens, departamentos que o usuário não possui acesso
    const userItens = response.data.result.filter((i)=> departamentos.indexOf(i.department.sapCode) >= 0);

    // usuario não tem acesso
    if(userItens.length===0){
      retorno = {status:'2',items: []};
    }else{
      //usuario tem acesso, retornar dados dos itens
      retorno = {status:'3',items:userItens}
    }

    // erro na requisição
  } catch (err) {
    console.error(err);
    retorno = {status:'99',message: err.message, items: []};
  }

  //console.log('response done',response && response.data);
  return {...retorno,codSap};
  //return {preco:20.19, item:{desc:"teste",dep:12}};
}

const getUserDepartments = (user)=>{
  if(!user || !user.managements) return [];
  return user.managements.reduce((a,b)=>{
    if(b.departments) return a.concat(b.departments.map((d)=>d.sapCode));
  },[]);
}

const getUserElasa = async(login)=>{

  let retorno;

  try {
    const response = await axios.post('http://hmlelasa.lasa.lojasamericanas.com.br/v1/user/byUsername/'+login, {}, {headers: {'Content-Type': 'application/json','Authorization': 'Bearer 58efdaf75b921528b09283e4'}});
    
    //Serviço retornou vazio
    if (_.isEmpty(response.data)) {
      retorno = {status: '1'};

      //retorno ok
    } else {
      retorno = {status: '3', user: response.data};
    }

    // erro na requisição
  } catch (err) {
    console.error(err);
    retorno = {status:'99',message: err.message};
  }
    return retorno;
};

module.exports = {
    wait,handleDadosMudarPreco,checkItem,getUserElasa
};
