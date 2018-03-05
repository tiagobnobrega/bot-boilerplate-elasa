
const axios = require('axios');

const wait= ms => new Promise(resolve => setTimeout(resolve, ms));

const handleCodSAPCheck= async(userInput,userLogin)=>{
  //TODO: get user data
  const departamentos = [];
  const codSap = await checkItem(userInput,departamentos);

  if(codSap.status==='0'){
    return {type:"text",content:"Preciso saber o código SAP."}
  }
  if(codSap.status==='1'){
    return {type:"text",content:"O código SAP passado é inválido"}
  }
  if(codSap.status==='2'){
    return {type:"text",content:"O usuário não tem acesso para alterar este item"}
  }
  if(codSap.status==='3'){
    return {type:"text",content:"Ocorreu um erro inesperado. Tente novamento ou consulto o administrador do sistema."}
  }
  return {type:"text",content:"Esta é uma resposta async que não deveria aparecer!!!"}
};

const checkItem= async (userInput,departamentos)=>{
  console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ CHECK ITEM @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
  let retorno;

  //identificar codSAP
  let codSapArray = userInput.match(/\b[\d]{6,}\b/);

  //completar com zeros a esquerda ate ficar com 18 char
  let codSap = codSapArray && codSapArray[0].padStart(18, '0');

  // Não foi identificado nenhum codigo sap
  if (codSap === null || codSap === undefined) {
    return {status: '0', items: []};
  }

  try {

    //chamar serviço com codSAP
    const response = await axios.post('http://hmlpromocao.lasa.lojasamericanas.com.br/v1/item',{query: codSap}, {headers: {'Content-Type': 'application/json','Authorization': 'Bearer 58efdaf75b921528b09283e4'}});

    retorno = response.data.result;

    // Serviço retornou vazio
    if (response.data === null || response.data.length === 0 || response.data.result.length === 0) {
      retorno = {status:'1',items: []};
      console.log('response done',response.data);
      return retorno;
    }

    // usuario não tem acesso
    if (departamentos.indexOf(response.data.result.department.sapCode) < 0) {
      retorno = {status:'2',items: []};
    }

    // erro na requisição
  } catch (err) {
    console.error(err);
    retorno = {status:'3',message: err.message, items: []};
  }

  console.log('response done',response.data);
  return retorno;
  //return {preco:20.19, item:{desc:"teste",dep:12}};
}

const getUSerElasa = async(login)=>{};

module.exports = {
    wait,handleCodSAPCheck,checkItem,getUSerElasa
};
