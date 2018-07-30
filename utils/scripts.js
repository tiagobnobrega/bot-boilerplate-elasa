const axios = require('axios');
const _ = require('lodash');

const ELASA_USER_API_URL = process.env.ELASA_USER_API_URL || 'http://ELASA_USER_API_URL---NOT_DEFINED';
const ELASA_ITEM_API_URL = process.env.ELASA_ITEM_API_URL || 'http://ELASA_ITEM_API_URL---NOT_DEFINED';
const ELASA_AUTH_TOKEN = process.env.ELASA_AUTH_TOKEN || 'AUTH_TOKEN';//ELASA_AUTH_TOKEN


//TODO rejectUntauthorized should not be used, fix certificate issues
const rootCas = require('ssl-root-cas/latest').create();
// require('https').globalAgent.options.ca = rootCas;
const https = require("https");
const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
    ca: rootCas
})

const getCurrency = (userInput = '') => {
    return userInput.match(/\b((((\d{1,2}\.\d{3})|(\d{1,5}))(\,\d+)?)){1}\b/);
};

const parseCurrency = (valor) => {
    valor = valor.replace('.', '').replace(',', '.');
    return parseFloat(valor);
};

const resolveCurrency = (message, context) => {
    let valor = getCurrency(message);
    valor = valor && valor[0] && parseCurrency(valor[0]);
    if (valor) {
        return {...context, currency: valor};
    }
    return context;
};

const resolveSapCode = (message, context) => {

    //identificar codSAP
    let codSapArray = message.match(/\b[\d]{6,}\b/);

    //completar com zeros a esquerda ate ficar com 18 char
    let codSap = codSapArray && codSapArray[0].padStart(18, '0');

    // Não foi identificado nenhum codigo sap
    if (codSap === null || codSap === undefined) {
        return context;
    }
    ;

    return {...context, codSapCandidate: codSap};

};

const formatCurrency = (valor) => {
    let formatted = valor.toFixed(2);
    return `R$ ${formatted.toString().replace(".", ",")}`;
};

const actionRequestMessageMapper = {
    'UNKNOWN': m => ({type: 'error', text: `Um erro inesperado ocorreu ao processar o arquivo: ${m.code}`}),
    '100': m => ({type: 'success', text: 'Processo realizado com sucesso'}),
    '200': m => ({type: 'error', text: 'Ocorreu um erro no servidor'}),
    '201': m => ({
        type: 'error',
        text: `Formato de arquivo inválido. Esperado: "${m.context && m.context.expected}", recebido: ${m.context && m.context.format}`
    }),
    '202': m => ({
        type: 'error',
        text: 'Não foi possível processar o arquivo'
    }),
    '203': m=>({
        type:'warning',
        text:'Nenhum dado para ser processado'
    }),
    '300': m => ({type: 'error', text: `Não foi possível processar o arquivo`}),
    '301': m => ({
        type: 'warning',
        text: `O item ${m.context && m.context.item}, na linha ${m.context && m.context.line} não foi encontrado na base`
    }),
    '302': m => ({
        type: 'warning',
        // text: `O item ${m.context && m.context.item}, na linha ${m.context && m.context.line}, com departamento ${m.context && m.context.department} não foi importado porque você não tem permissão neste departamento`
        text: `O item ${m.context && m.context.item}, com departamento ${m.context && m.context.department} não foi importado porque você não tem permissão neste departamento`
    }),
    '303': m=>({
        type: 'warning',
        text: `O item ${m.context && m.context.item} de preço R$ ${m.context && m.context.price} estava replicado e por esse motivo foi escolhido o menor preço R$ ${m.context && m.context.lowerPrice}`
    }),
    '304': m=>({
        type: 'warning',
        text: `O item ${m.context && m.context.item} de preço R$ ${m.context && m.context.price} é de uma variante já inserida no arquivo e por isso foi escolhido o menor preço R$ ${m.context && m.context.lowerPrice}`
    }),
    '305': m=>({
        type: 'warning',
        text: `O item ${m.context && m.context.item} não possui preço ou o valor está zerado`
    }),
    '400': m=>({
        type: 'warning',
        text: `Envio normal não encontrado`
    }),
    '401': m=>({
        type: 'error',
        text: `Não é possível enviar preço normal após: ${m.context && m.context.timelimit}`
    }),
    '402': m=>({
        type: 'error',
        text: 'Configuração de limite e hora não encontrada'
    }),

};


const handleFileValidation = ({
                                  userInputData = {},
                                  messageMapper,
                                  successMessage = "Sua solicitação está sendo processada.",
                                  errorMessage = "Ocorreram erros no processamento do arquivo.",
                                  invalidActionMesssage = "Infelizmente não sou capaz de processar este tipo de ação."
                              }) => {

    if (userInputData.action !== 'normal_price.file_validation') {
        return {
            context: {},
            reply: {type: "text", content: invalidActionMesssage + ". action=" + userInputData.action}
        };
    }

    messageMapper = {
        ...actionRequestMessageMapper,
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


const handlePriceValidationMessage = ({userInputData = {}, messageMapper = {}, invalidActionMesssage = "Infelizmente não sou capaz de processar este tipo de ação."}) => {

    if (userInputData.action !== 'normal_price.validation') {
        return {
            reply: {type: "text", content: invalidActionMesssage + ". action=" + userInputData.action}
        };
    }
    messageMapper = {
        ...actionRequestMessageMapper,
        ...messageMapper
    };

    const replyText = userInputData.messages
        .reduce((a, b) => {
            const mapper = messageMapper[b.code] || messageMapper['UNKNOWN'];
            const {text} = mapper(b);
            return (a ? a + "\n" + text : text);
        }, null);

    return {reply:{type:"text",content:replyText}};

};

module.exports = {
    resolveCurrency, resolveSapCode, handleFileValidation, handlePriceValidationMessage
};
