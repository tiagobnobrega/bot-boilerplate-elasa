const axios = require('axios');
const _ = require('lodash');
const numeral = require('numeral');

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
});

numeral.register('locale', 'br', {
    delimiters: {
        thousands: '.',
        decimal: ','
    },
    abbreviations: {
        thousand: 'k',
        million: 'Mi',
        billion: 'Bi',
        trillion: 'Tri'
    },
    ordinal: (number) => '°',
    currency: {
        symbol: 'R$'
    }
});
numeral.locale('br');


const getCurrency = (userInput = '') => {
    return userInput.match && userInput.match(/\b((((\d{1,2}\.\d{3})|(\d{1,5}))(\,\d+)?)){1}\b/);
};

const parseCurrency = (valor) => {
    valor = valor.replace('.', '').replace(',', '.');
    return parseFloat(valor);
};

const formatCodSap = (valor) => {
    return parseInt(valor).toString();
};

const formatCurrency = val => numeral(val).format('$ 0,0.00');

const resolveCurrency = (message, context) => {
    let valor = getCurrency(message);
    valor = valor && valor[0] && parseCurrency(valor[0]);
    if (valor) {
        return {...context, currency: valor, currencyFmt: formatCurrency(valor)};
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

    return {...context, codSapCandidate: codSap, codSapCandidateFmt: formatCodSap(codSap)};

};

const actionRequestMessageMapper = {
    'UNKNOWN': m => ({type: 'error', text: `Um erro inesperado ocorreu ao processar o arquivo: ${m.code}`}),
    '100': m => ({type: 'success', text: 'Os itens foram enviados para processamento com sucesso'}),
    '101': m => ({type: 'success', text: 'Consegui enviar alguns itens com sucesso.'}),
    '200': m => ({type: 'error', text: 'Ocorreu um erro no servidor'}),
    '201': m => ({
        type: 'error',
        text: `Formato de arquivo inválido. Esperado: "${m.context && m.context.expected}", recebido: ${m.context && m.context.format}.`
    }),
    '202': m => ({
        type: 'error',
        text: 'Não foi possível processar o arquivo.'
    }),
    '203': m => ({
        type: 'warning',
        text: 'O arquivo enviado está vazio.'
    }),
    '300': m => ({type: 'error', text: `Não foi possível processar o arquivo.`}),
    '301': m => ({
        type: 'warning',
        text: `O item ${m.context && formatCodSap(m.context.item)} não foi encontrado. Tente novamente.`
    }),
    '302': m => ({
        type: 'warning',
        text: `O item ${m.context && formatCodSap(m.context.item)}, do departamento ${m.context && m.context.department}, não foi alterado porque você não tem acesso a esse departamento.`
    }),
    '303': m => ({
        type: 'success',
        // text: `O item ${m.context && formatCodSap(m.context.item)} de preço ${m.context && formatCurrency(m.context.price)} estava replicado e por esse motivo foi escolhido o menor preço R$ ${m.context && m.context.lowerPrice}.`
        text: `Os itens foram enviados para processamento com sucesso.`
    }),
    '304': m => ({
        type: 'success',
        // text: `O item ${m.context && formatCodSap(m.context.item)} de preço ${m.context && formatCurrency(m.context.price)} é de uma variante já inserida no arquivo e por isso foi escolhido o menor preço R$ ${m.context && m.context.lowerPrice}.`
        text: `Os itens foram enviados para processamento com sucesso.`
    }),
    '305': m => ({
        type: 'warning',
        text: `O item ${m.context && formatCodSap(m.context.item)} está sem preço ou com o valor zerado.`
    }),
    '400': m => ({
        type: 'warning',
        text: `Envio normal não encontrado`
    }),
    '401': m => ({
        type: 'error',
        // text: `Não é possível enviar preço normal após: ${m.context && m.context.timelimit}`
        text: `Não foi possível enviar o preço normal. O limite de horário foi ultrapassado.`
    }),
    '402': m => ({
        type: 'error',
        text: 'O arquivo não pode ser processado, pois a configuração de limite e hora não foi encontrada.'
    }),

};


const handleFileValidation = ({
                                  userInputData = {},
                                  messageMapper,
                                  errorMessage = "Ocorreram erros no processamento do arquivo.",
                                  invalidActionMesssage = "Infelizmente não sou capaz de processar este tipo de ação."
                              }) => {

    if (userInputData.action !== 'normal_price.file_validation') {
        return {
            reply: {type: "text", content: invalidActionMesssage + ". action=" + userInputData.action}
        };
    }

    messageMapper = {
        ...actionRequestMessageMapper,
        ...messageMapper
    };

    const successMessage = userInputData.messages.filter(m => {
        const mappedMessage =  messageMapper[m.code.toString()](m);
        return mappedMessage.type ==='success'
    })[0];
    const errorMessages = userInputData.messages.filter(m => {
        const mappedMessage =  messageMapper[m.code.toString()](m);
        return mappedMessage.type !=='success'
    });
    const replies = [];

    if (successMessage) {
        replies.push({
            "type": "action",
            "payload": {
                "action": "normal_price.send_file",
                "content": messageMapper[successMessage.code.toString()](successMessage).text
            }
        });
    }

    if (errorMessages.length > 0) {
        const messages = errorMessages.map(m => {
            const mapper = messageMapper[m.code.toString()] || messageMapper['UNKNOWN'];
            return mapper(m);
        });
        replies.push({
            "type": "modal",
            "payload": {
                "content": errorMessage,
                messages
            }
        });
    }
    return {replies};
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
            const mapper = messageMapper[b.code.toString()] || messageMapper['UNKNOWN'];
            const {text} = mapper(b);
            return (a ? a + "\n" + text : text);
        }, null);

    return {reply: {type: "text", content: replyText}};

};

module.exports = {
    resolveCurrency, resolveSapCode, handleFileValidation, handlePriceValidationMessage
};
