const axios = require('axios');

const wait= ms => new Promise(resolve => setTimeout(resolve, ms));
const getCurrency = (userInput)=>{
  // return userInput.match(/[+-]?[0-9]{1,3}(?:[0-9]*(?:[.,][0-9]{2})?|(?:,[0-9]{3})*(?:\.[0-9]{2})?|(?:\.[0-9]{3})*(?:,[0-9]{2})?)/)[0];
  return userInput.match(/[+-]?[0-9]{1,3}(?:\.?[0-9]{3})*[,][0-9]{2}/);
}
const handleDadosMudarPreco= async(userInput,userLogin,context={})=>{
  let replyMessage = "";
  let valor = context.mudar_preco_valor;

  if(!valor){
  valor = getCurrency(userInput);
  }

  if(!valor){
    replyMessage+="Informe por favor o valor do novo preço.";
  }

  //TODO: GET USER DATA
  const departamentos = ['013','023'];
  const {status,items,codSap} = await checkItem(userInput,departamentos);

  if(status==='0'){
    replyMessage+="Preciso saber o código SAP do item.";
  }
  if(status==='1'){
    replyMessage+=`O código SAP "${parseInt(codSap)}" é inválido. Tente informar novamente`;
    //TODO: ZERAR CODIGO SAP DO CONTEXTO
  }

  if(status==='99'){
    replyMessage="Ocorreu um erro inesperado. Tente novamento ou consulto o administrador do sistema."
    //TODO: ZERAR CONTEXTO
  }
  if(status==='2'){
    replyMessage="Seu usuário não tem acesso para alterar este item";
    //TODO: ZERAR CONTEXTO
  }
  if(status==='3'){
    if(valor){
      replyMessage=`Ok. Deseja alterar o valor do item "${items[0].description}" (${parseInt(codSap)}) para ${valor} ?`;
    }

  }

  return {context:null,reply:{type:"text",content:replyMessage}};

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

const getUSerElasa = async(login)=>{};

module.exports = {
    wait,handleDadosMudarPreco,checkItem,getUSerElasa
};
