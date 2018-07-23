const axios = require('axios');
const _ = require('lodash');

const ELASA_USER_API_URL = process.env.ELASA_USER_API_URL || 'http://hmlelasa.lasa.lojasamericanas.com.br/v1/user/byUsername/';
const ELASA_ITEM_API_URL = process.env.ELASA_ITEM_API_URL || 'http://hmlpromocao.lasa.lojasamericanas.com.br/v1/item';
const ELASA_AUTH_TOKEN = process.env.ELASA_AUTH_TOKEN || 'AUTH_TOKEN';//ELASA_AUTH_TOKEN


//TODO rejectUntauthorized should not be used, fix certificate issues
const rootCas = require('ssl-root-cas/latest').create();
// require('https').globalAgent.options.ca = rootCas;
const https = require("https");
const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
    ca: rootCas
})

const wait= ms => new Promise(resolve => setTimeout(resolve, ms));
const getCurrency = (userInput='')=>{
  return userInput.match(/\b((((\d{1,2}\.\d{3})|(\d{1,5}))(\,\d+)?)){1}\b/);
};

const parseCurrency = (valor)=>{
  valor = valor.replace('.','').replace(',','.');
  return parseFloat(valor);
};

const formatCurrency = (valor)=>{
  let formatted = valor.toFixed(2);
  return `R$ ${formatted.toString().replace(".",",")}`;
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
  valor = valor && valor[0] && parseCurrency(valor[0]);
  }

 /* if(!valor){
    replyMessage+="Pode me informar, por favor, o valor do novo preço.";
  }else{
    context.mudar_preco_valor = valor;
  }
*/
  if(!mudarPrecoItems){
    const {user} = await getUserElasa(userId);
    const departamentos = getUserDepartments(user);
    mudarPrecoItems = await checkItem(userMessage,departamentos);
  }
  const {status,items,codSap} = mudarPrecoItems;

  if(valor){
    console.log('valor2 '+valor);
    console.log('status2 '+status);
    if(status==='0'){
      context.mudar_preco_valor = valor;
      replyMessage+= " Preciso saber o código SAP do item também.";

    } else if(status==='1'){
      context.mudar_preco_valor = valor;
      replyMessage+=` O código SAP "${parseInt(codSap)}" é inválido. Tente novamente, por favor.`;

    } else if(status==='2'){
      replyMessage="Seu usuário não tem acesso para alterar este item. Caso precise de mais alguma ajuda, estou aqui.";
      context = {};

    } else if(status==='3'){
      context.mudar_preco_sap = mudarPrecoItems;
      replyMessage=`Ok. Deseja alterar o valor do item "${items[0].description}" (${parseInt(codSap)}) para ${formatCurrency(valor)} ?`;
      context._dialog = nextDialogOnSuccess;
    }

  } else {
    console.log('valor1 '+valor);
    console.log('status1 '+status);
    if (status==='0'){
      replyMessage+="Pode me informar, por favor, o valor do novo preço e o código SAP do item?";

    } else if(status==='1'){
      replyMessage+=` O código SAP "${parseInt(codSap)}" é inválido. Tente novamente, por favor.`;

    } else if(status==='2'){
      replyMessage="Seu usuário não tem acesso para alterar este item. Caso precise de mais alguma ajuda, estou aqui.";
      context = {};

    }  else if(status==='3'){
      context.mudar_preco_sap = mudarPrecoItems;
      replyMessage+="Pode informar, por favor, o valor do novo preço?";

    }
  }

  if(status==='99'){
    replyMessage="Ocorreu um erro inesperado. Tente novamente ou consulte o administrador do sistema."
    context = {};
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
    const response = await axios.post(ELASA_ITEM_API_URL,{query: codSap}, {httpsAgent, headers: {'Content-Type': 'application/json','Authorization': `Bearer ${ELASA_AUTH_TOKEN}`}});

    retorno = response.data.result;


    // Serviço retornou vazio
    if (_.isEmpty(response.data)|| _.isEmpty(response.data.result)){

      retorno = {status:'1',items: [], codSap};
      // console.log('response done',response.data);
      return retorno;
    }

    //filtrar da lista de itens, departamentos que o usuário não possui acesso
    const userItens = response.data.result.filter((i)=> departamentos.indexOf(i.department.sapCode) >= 0);

    /*const {userId} = context;
    const {user} = await getUserElasa(userId);
    const departamentos = getUserDepartments(user);

    let indice = -1;
    for(let i=0 ; i<departamentos.length; i++){
      if(response.data.result.department.sapCode === departamentos[i]){
        indice = i;
        break;
      }
    }
    console.log(':::::: INDICE::::::', indice);
  */

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
    const response = await axios.post(ELASA_USER_API_URL+login, {}, {httpsAgent, headers: {'Content-Type': 'application/json','Authorization': `Bearer ${ELASA_AUTH_TOKEN}`}});

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


const handleFileValidation = ({
                                  userInputData = {},
                                  messageMapper,
                                  successMessage = "Sua solicitação está sendo processada.",
                                  errorMessage = "Ocorreram erros no processamento do arquivo.",
                                  invalidActionMesssage = "Infelizmente não sou capaz de processar este tipo de ação."
                              }) => {

    if (userInputData.action !== 'normal_price.file_validation') {
        return {context: {}, reply: {type: "text", content: invalidActionMesssage+". action="+userInputData.action}};
    }

    messageMapper = {
        'UNKNOWN': m => ({type: 'error', text: `Um erro inesperado ocorreu ao processar o arquivo: ${m.code}`}),
        '100': m => ({type: 'success', text: 'Processo realizado com sucesso'}),
        '200': m => ({type: 'error', text: 'Ocorreu um erro no servidor'}),
        '201': m => ({
            type: 'error',
            text: `Formato de arquivo inválido. Esperado: "${m.context && m.context.expected}", recebido: ${m.context && m.context.format}`
        }),
        '202': m => ({
            type: 'error',
            text: `Não é possível enviar preço normal após: ${m.context && m.context.timelimit}`
        }),
        '300': m => ({type: 'error', text: `Não foi possível processar o arquivo`}),
        '301': m => ({
            type: 'warning',
            text: `O item ${m.context && m.context.item}, na linha ${m.context && m.context.line} não foi encontrado na base`
        }),
        '302': m => ({
            type: 'warning',
            text: `O item ${m.context && m.context.item}, na linha ${m.context && m.context.line}, com departamento ${m.context && m.context.department} não foi importado porque você não tem permissão neste departamento`
        }),
        ...messageMapper
    };

    const hasErrors = !!userInputData.messages.filter(m => m.code !== '100').length;
    const messages = userInputData.messages.map(m => {
        const mapper = messageMapper[m.code] || messageMapper['UNKNOWN'];
        return mapper(m);
    });

    if (hasErrors) {
        return {
            reply: {
                "type": "modal",
                "payload": {
                    "content": errorMessage,
                    messages
                }
            }
        }
            ;
    } else {
        return {
            reply: {
                "type": "action",
                "payload": {
                    "action": "normal_price.send_file",
                    "content": successMessage,
                }
            }
        }
    }
};

module.exports = {
    wait, handleDadosMudarPreco, checkItem, getUserElasa, handleFileValidation
};
