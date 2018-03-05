
const axios = require('axios');

module.exports = {
    wait: ms => new Promise(resolve => setTimeout(resolve, ms)),
    checkItem: async (userInput,departamentos)=>{

        let retorno;

        //identificar codSAP
        let codSapArray = userInput.match(/\b[\d]{6,}\b/);

        //completar com zeros a esquerda ate ficar com 18 char
        let codSap = codSapArray[0].padStart(18, '0');

        // Não foi identificado nenhum codigo sap
        if (codSap === null || codSap === undefined) {
            retorno = {status: '0', items: []};
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
    },
  getUSerElasa: async (login)=>{

  }
}
