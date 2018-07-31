const axios = require('axios');
require('dotenv').config();
const chalk = require('chalk');

const PORT = process.env.PORT || 80;
const BASE_URL = 'http://localhost';

const axiosClient = axios.create({
    baseURL: `${BASE_URL}${PORT && PORT !== 80 ? ':' + PORT : ''}`,
    timeout: 10000,
    // headers: {'X-Custom-Header': 'foobar'}
});

jest.setTimeout(7000);

const buildNewSession = () => ({
    contextId: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    user: "app.spec"
});

const postMessage = async (msgObject) => {
    try {
        const postData = {...SESSION_INFO, ...msgObject};
        // console.log('posting:', postData);
        const ret = await axiosClient.post('/api/raw', postData);
        return ret.data;
    } catch (e) {
        console.error(e);
        return e;
    }
};

const postTextMessage = async (text) => {
    return postMessage({type: 'text', payload: text.toString()});
};

const postActionMessage = async ({action, messages}) => {
    return postMessage({type: 'action', payload: {action, messages}})
};

let SESSION_INFO = buildNewSession();

beforeEach(() => {
    SESSION_INFO = buildNewSession();
});


const expectFileMessageTypeEnum = m => {
    expect(['success', 'warning', 'error']).toContain(m.type);
};

console.info(chalk.black.bgBlue("Don't forget to start local server with 'yarn start' command."));
console.info(chalk.black.bgYellow.bold("Estes são testes integrados, seu funcionamento depende do conteúdo das respostas cadastradas no fluxo de dialogos e treinamento de intenções e entidades."));
console.info(chalk.black.bgYellow.bold("Alterações no fluxo devem ser refletidas nos testes para o sucesso de sua execução"));

describe('Testes integrados do bot', () => {

    describe('Troca de mensagem simples', () => {
        test('mensagem simples de olá', async () => {
            const {replies} = await postTextMessage('olá');
            expect(replies).toHaveLength(1);
            expect(replies[0]).toMatchObject({
                "type": "text",
                "payload": expect.any(String)
            });
        });
    });

    describe('Alteração de preço em massa', () => {
        test('mudar preço normal em massa', async () => {
            const {replies} = await postTextMessage('mudar preço normal em massa');
            expect(replies).toHaveLength(1);
            expect(replies[0]).toMatchObject({
                "type": "action",
                "payload": {
                    "action": "normal_price.more_info",
                    "content": expect.any(String)
                }
            });
        });

        test('mensagem tipo "action/normal_price.file_validation" no contexto raiz com erros', async () => {
            const postedFile = {
                "action": "normal_price.file_validation",
                "messages": [
                    {
                        "code": "100",
                        "text": "sucesso!"
                    },
                    {
                        "code": "200",
                        "text": "erro no servidor"
                    },
                    {
                        "code": "201",
                        "text": "formato de arquivo inválido",
                        "context": {
                            "format": "pdf",
                            "expected": "xls,xlsx"
                        }
                    },
                    {
                        "code": "202",
                        "text": "não é possível enviar preço normal após as 19h30",
                        "context": {
                            "timelimit": "19:30:00"
                        }
                    },
                    {
                        "code": "300",
                        "text": "não foi possível processar o arquivo"
                    },
                    {
                        "code": "301",
                        "text": "o item 123, na linha 456 não foi encontrado na base",
                        "context": {
                            "item": 123,
                            "line": 456
                        }
                    },
                    {
                        "code": "302",
                        "text": "o item 321, na linha 654, com departamento 987 não foi importado porque o usuario não tem permissão neste departamento",
                        "context": {
                            "item": 321,
                            "line": 654,
                            "department": 987
                        }
                    }
                ]
            };

            const {replies} = await postActionMessage(postedFile);
            expect(replies).toHaveLength(1);

            expect(replies[0]).toMatchObject({
                "type": "modal",
                "payload": {
                    "content": expect.any(String),
                    "messages": expect.any(Array)
                }
            });

            expect(replies[0].payload.messages).toHaveLength(postedFile.messages.length);
            replies[0].payload.messages.forEach(m => {
                expectFileMessageTypeEnum(m);
                expect(m.text).toEqual(expect.any(String));
            })
        });

        test('mensagem tipo "action" no contexto raiz SEM erros', async () => {
            const postedFile = {
                "action": "normal_price.file_validation",
                "messages": [
                    {
                        "code": "100",
                        "text": "sucesso!"
                    }
                ]
            };

            const {replies} = await postActionMessage(postedFile);
            expect(replies).toHaveLength(1);

            expect(replies[0]).toMatchObject({
                "type": "action",
                "payload": {
                    "action": "normal_price.send_file",
                    "content": expect.any(String)
                }
            });
        });
    });

    describe('Alteração de preço normal', () => {
        test('mudar preço sem definir tipo', async () => {
            const {replies} = await postTextMessage('mudar preço de um item');
            expect(replies).toHaveLength(1);
            expect(replies[0]).toMatchObject({
                "type": "text",
                "payload": "Eu consigo alterar apenas preço normal. Você gostaria de prosseguir?"
            });
        });

        test('mudar preço normal SEM passar SAP ou valor', async () => {
            const {replies} = await postTextMessage('mudar preço normal de um item');
            expect(replies).toHaveLength(1);
            expect(replies[0]).toMatchObject({
                "type": "text",
                "payload": "Pode me informar, por favor, o valor do novo preço e o código SAP do item?"
            });
        });

        test('mudar preço normal passando apenas o código SAP', async () => {
            const {replies} = await postTextMessage('mudar preço normal do item 2134567');
            expect(replies).toHaveLength(1);
            expect(replies[0]).toMatchObject({
                "type": "text",
                "payload": "Pode informar, por favor, o valor do novo preço?"
            });
        });

        test('mudar preço normal passando apenas o valor', async () => {
            const {replies} = await postTextMessage('mudar preço normal de um item para 20,44 reais');
            expect(replies).toHaveLength(1);
            expect(replies[0]).toMatchObject({
                "type": "text",
                "payload": "Preciso saber o código SAP do item também"
            });
        });

        test('mudar preço normal passando valor e código SAP', async () => {
            const {replies} = await postTextMessage('mudar preço normal um item para 20 reais de sap 2134567');
            expect(replies).toHaveLength(1);
            expect(replies[0]).toMatchObject({
                "type": "action",
                "payload": {
                    "action": "normal_price.validate",
                    "context": {
                        "itemSapCode": "000000000002134567"
                    }
                }
            });
        });

        test('retorno de validacao de codigo sap para mudanca de preco normal com SUCESSO', async () => {
            // isto deve definir a conversa para o dialogo correto
            await postTextMessage('mudar preço normal um item para 20 reais de sap 2134567');

            const postedAction = {
                "action": "normal_price.validation",
                "messages": [
                    {
                        "code": "100",
                        "text": "sucesso!"
                    }
                ]
            };

            const {replies} = await postActionMessage(postedAction);
            expect(replies).toHaveLength(1);
            expect(replies[0]).toMatchObject({
                "type": "text",
                "payload": "Tem certeza que deseja alterar o item 2134567 para o valor R$ R$ 20,00 ? "
            });
        });

        test('retorno de validacao de codigo sap para mudanca de preco normal com ERRO', async () => {
            // isto deve definir a conversa para o dialogo correto
            await postTextMessage('mudar preço normal um item para 20 reais de sap 2134567');

            const postedAction = {
                "action": "normal_price.validation",
                "messages": [
                    {
                        "code": "302",
                        "text": "o item 321 com departamento 987 não foi importado porque o usuario não tem permissão neste departamento",//it's ignored
                        "context": {
                            "item": 321,
                            "department": 987
                        }
                    }
                ]
            };

            const {replies} = await postActionMessage(postedAction);
            expect(replies).toHaveLength(1);
            expect(replies[0]).toMatchObject({
                "type": "text",
                "payload": "O item 321, com departamento 987 não foi importado porque você não tem permissão neste departamento"
            });
        });

        test('confirmação POSITIVA de mudar preço normal', async () => {

        });

        test('confirmação NEGATIVA de mudar preço normal', async () => {
        });

    });

});
