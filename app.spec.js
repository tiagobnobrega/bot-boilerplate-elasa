const axios = require('axios');
require('dotenv').config();
const chalk = require('chalk');

// LOCAL
// const PORT = process.env.PORT || 80;
// const BASE_URL = 'http://localhost';

//EXTERNO
const PORT = 80;
const BASE_URL = 'https://elasa-chatbot.mybluemix.net';

const axiosClient = axios.create({
    baseURL: `${BASE_URL}${PORT && PORT !== 80 ? ':' + PORT : ''}`,
    timeout: 10000,
    // headers: {'X-Custom-Header': 'foobar'}
});

jest.setTimeout(20000);

const buildNewSession = () => ({
    conversationId: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
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

    describe('Início de dialogo', () => {
        test('mensagem "##start_conversation@@" deve retornar mensagem de inicio de dialogo início de dialogo', async () => {
            const {replies} = await postTextMessage('##start_conversation@@');
            expect(replies).toHaveLength(2);
            expect(replies[0]).toMatchObject({
                "type": "text",
                "payload": "Oi, eu sou a Laís, a Inteligência Artificial do Elasa. Ainda estou aprendendo a realizar as tarefas da área Comercial. Por enquanto, já sei realizar alterações de preço normal. Quer testar? É só me dizer o item e o preço ou baixar este arquivo aqui e me enviar de volta, tá bom?"
            });
            expect(replies[1]).toMatchObject({
                "type": "action",
                "payload": {
                    "action": "normal_price.more_info",
                }
            });
        });

        test('mensagem envio de arquivo após mensagem inicial deve retornar validação do arquivo', async () => {
            await postTextMessage('##start_conversation@@');
            const postedFile = {
                "action": "normal_price.more_info",
                "messages": [
                    {
                        "code": 100,
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

        test('mensagem "vamos lá" no contexto raiz deve informar uma alteração de preço', async () => {
            const {replies} = await postTextMessage('vamos lá');
            expect(replies).toHaveLength(2);
            expect(replies[0]).toMatchObject({"payload": "Para alterar o preço normal é só me dizer o item e o preço, ou baixar este arquivo aqui e me enviar de volta", "type": "text"});
            expect(replies[1]).toMatchObject({"payload": {"action": "normal_price.more_info"}, "type": "action"});
        });

        test('mensagem "vamos lá" seguido de  "em massa" deve retornar action normal_price.more_info', async () => {
            await postTextMessage('vamos lá');
            const {replies} = await postTextMessage('em massa');
            expect(replies).toHaveLength(1);
            expect(replies[0]).toMatchObject({
                "type": "action",
                "payload": {
                    "action": "normal_price.more_info",
                    "content": "Vamos fazer assim, preenche esse modelo e me manda."
                }
            });
        });

        test('mensagem "vamos lá" seguido de  "um unico item" deve perguntar sobre as informações de alteração de item', async () => {
            await postTextMessage('vamos lá');
            const {replies} = await postTextMessage('um único item');
            expect(replies).toHaveLength(1);
            expect(replies[0]).toMatchObject({
                "type": "text",
                "payload": "Pode me informar, por favor, o valor do novo preço e o código SAP do item?"
            });
        });

    });

    describe('Alteração de preço em massa', () => {

        test('mudar preço normal em massa', async () => {
            const {replies} = await postTextMessage('mudar preço normal em massa');
            expect(replies).toHaveLength(2);
            expect(replies[0]).toMatchObject({"payload": "Tudo bem. Vamos prosseguir com a alteração de preço normal.", "type": "text"});
            expect(replies[1]).toMatchObject({
                "type": "action",
                "payload": {
                    "action": "normal_price.more_info",
                    "content": expect.any(String)
                }
            });
        });

        test('mensagem tipo "action/normal_price.more_info" no contexto raiz com ERROS', async () => {
            const postedFile = {
                "action": "normal_price.more_info",
                "messages": [
                    {
                        "code": 200,
                        "text": "erro no servidor"
                    },
                    {
                        "code": 201,
                        "text": "formato de arquivo inválido",
                        "context": {
                            "format": "pdf",
                            "expected": "xls,xlsx"
                        }
                    },
                    {
                        "code": 202,
                        "text": "não é possível enviar preço normal após as 19h30",
                        "context": {
                            "timelimit": "19:30:00"
                        }
                    },
                    {
                        "code": 300,
                        "text": "não foi possível processar o arquivo"
                    },
                    {
                        "code": 301,
                        "text": "o item 123, na linha 456 não foi encontrado na base",
                        "context": {
                            "item": 123,
                            "line": 456
                        }
                    },
                    {
                        "code": 302,
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

        test('mensagem tipo "action/normal_price.more_info" no contexto raiz com SUCESSO (100)', async () => {
            const postedFile = {
                "action": "normal_price.more_info",
                "messages": [
                    {
                        "code": 100,
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

        test('mensagem tipo "action/normal_price.more_info" no contexto raiz com SUCESSO (304)', async () => {
            const postedFile = {
                "action": "normal_price.more_info",
                "messages": [
                    {
                        "code": 304,
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

        test('mensagem tipo "action/normal_price.more_info" no contexto raiz com SUCESSO (303)', async () => {
            const postedFile = {
                "action": "normal_price.more_info",
                "messages": [
                    {
                        "code": 303,
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

        test('mensagem tipo "action/normal_price.more_info" no contexto raiz com SUCESSO PARCIAL', async () => {
            const postedFile = {
                "action": "normal_price.more_info",
                "messages": [
                    {
                        "code": 101,
                        "text": "sucesso!"
                    },
                    {
                        "code": 302,
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
            expect(replies).toHaveLength(2);

            expect(replies[0]).toMatchObject({
                "type": "action",
                "payload": {
                    "action": "normal_price.send_file",
                    "content": expect.any(String)
                }
            });
            expect(replies[1]).toMatchObject({
                "type": "modal",
                payload: {
                    "content": expect.any(String),
                    "messages": expect.any(Array)
                }
            });
        });

        test('cancelar mudar preço normal em massa', async () => {
            await postTextMessage('mudar preço normal em massa');
            const {replies} = await postTextMessage('mudei de ideia');
            expect(replies).toHaveLength(1);
            expect(replies[0]).toMatchObject({"payload": "Ok. Sem problemas. Estou aqui se precisar de mais alguma coisa.", "type": "text"});
        });

        test('repetir operacao após envio de arquivo mudar preço normal em massa', async () => {
            await postTextMessage('mudar preço normal em massa');
            const postedFile = {
                "action": "normal_price.more_info",
                "messages": [
                    {
                        "code": 200,
                        "text": "erro no servidor"
                    },
                    {
                        "code": 201,
                        "text": "formato de arquivo inválido",
                        "context": {
                            "format": "pdf",
                            "expected": "xls,xlsx"
                        }
                    },
                    {
                        "code": 202,
                        "text": "não é possível enviar preço normal após as 19h30",
                        "context": {
                            "timelimit": "19:30:00"
                        }
                    },
                    {
                        "code": 300,
                        "text": "não foi possível processar o arquivo"
                    },
                    {
                        "code": 301,
                        "text": "o item 123, na linha 456 não foi encontrado na base",
                        "context": {
                            "item": 123,
                            "line": 456
                        }
                    },
                    {
                        "code": 302,
                        "text": "o item 321, na linha 654, com departamento 987 não foi importado porque o usuario não tem permissão neste departamento",
                        "context": {
                            "item": 321,
                            "line": 654,
                            "department": 987
                        }
                    }
                ]
            };

            await postActionMessage(postedFile);
            const {replies} = await postTextMessage('quero fazer de novo');

            expect(replies[0]).toMatchObject({
                "type": "action",
                "payload": {
                    "action": "normal_price.more_info",
                    "content": expect.any(String)
                }
            });
        });

        test('solicitar alteracao em massa após envio de arquivo mudar preço normal em massa', async () => {
            await postTextMessage('mudar preço normal em massa');
            const postedFile = {
                "action": "normal_price.more_info",
                "messages": [
                    {
                        "code": 200,
                        "text": "erro no servidor"
                    },
                    {
                        "code": 201,
                        "text": "formato de arquivo inválido",
                        "context": {
                            "format": "pdf",
                            "expected": "xls,xlsx"
                        }
                    },
                    {
                        "code": 202,
                        "text": "não é possível enviar preço normal após as 19h30",
                        "context": {
                            "timelimit": "19:30:00"
                        }
                    },
                    {
                        "code": 300,
                        "text": "não foi possível processar o arquivo"
                    },
                    {
                        "code": 301,
                        "text": "o item 123, na linha 456 não foi encontrado na base",
                        "context": {
                            "item": 123,
                            "line": 456
                        }
                    },
                    {
                        "code": 302,
                        "text": "o item 321, na linha 654, com departamento 987 não foi importado porque o usuario não tem permissão neste departamento",
                        "context": {
                            "item": 321,
                            "line": 654,
                            "department": 987
                        }
                    }
                ]
            };

            await postActionMessage(postedFile);
            const {replies} = await postTextMessage('alterar em massa');

            expect(replies[0]).toMatchObject({
                "type": "action",
                "payload": {
                    "action": "normal_price.more_info",
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
                "payload": "Pode me informar, por favor, o valor do novo preço e o código SAP do item?",
                "type": "text"
            });
        });

        test('mudar preço normal SEM passar SAP ou valor', async () => {
            const {replies} = await postTextMessage('mudar preço normal de um item');
            expect(replies).toHaveLength(2);
            expect(replies[0]).toMatchObject({"payload": "Tudo bem. Vamos prosseguir com a alteração de preço normal.", "type": "text"});
            expect(replies[1]).toMatchObject({"payload": "Pode me informar, por favor, o valor do novo preço e o código SAP do item?", "type": "text"});
        });

        test('cancelamento de mudar preço normal', async () => {
            await postTextMessage('mudar preço normal de um item');
            const {replies} = await postTextMessage('mudei de ideia');
            expect(replies).toHaveLength(1);
            expect(replies[0]).toMatchObject({
                "type": "text",
                "payload": "Ok. Se precisar de mais alguma ajuda, estarei à disposição."
            });
        });

        test('mudar de ideia para mudar preço em massa', async () => {
            await postTextMessage('mudar preço normal de um item');
            const {replies} = await postTextMessage('na verdade é uma alteração de preço normal em massa');
            expect(replies).toHaveLength(3);
            expect(replies[0]).toMatchObject({"payload": "Ok. Tranquilo.", "type": "text"});
            expect(replies[1]).toMatchObject({"payload": "Tudo bem. Vamos prosseguir com a alteração de preço normal.", "type": "text"});
            expect(replies[2]).toMatchObject({"payload": {"action": "normal_price.more_info", "content": "Vamos fazer assim, preenche esse modelo e me manda."}, "type": "action"});
        });

        test('mudar preço normal passando apenas o código SAP', async () => {
            const {replies} = await postTextMessage('mudar preço normal do item 2134567');
            expect(replies).toHaveLength(2);
            expect(replies[0]).toMatchObject({"payload": "Tudo bem. Vamos prosseguir com a alteração de preço normal.", "type": "text"});
            expect(replies[1]).toMatchObject({"payload": "Pode informar, por favor, o valor do novo preço?", "type": "text"});
        });

        test('mudar preço normal passando apenas o valor', async () => {
            const {replies} = await postTextMessage('mudar preço normal de um item para 20,44 reais');
            expect(replies).toHaveLength(2);
            expect(replies[0]).toMatchObject({"payload": "Tudo bem. Vamos prosseguir com a alteração de preço normal.", "type": "text"});
            expect(replies[1]).toMatchObject({
                "type": "text",
                "payload": "Preciso saber o código SAP do item também, por favor."
            });
        });

        test('mudar preço normal passando valor e código SAP', async () => {
            const {replies} = await postTextMessage('mudar preço normal um item para 3,99 reais de sap 2171545');
            expect(replies).toHaveLength(2);
            expect(replies[0]).toMatchObject({"payload": "Tudo bem. Vamos prosseguir com a alteração de preço normal.", "type": "text"});
            expect(replies[1]).toMatchObject({
                "type": "action",
                "payload": {
                    "action": "normal_price.validate",
                    "context": {
                        "itemSapCode": "000000000002171545"
                    }
                }
            });
        });

        test('mudar preço normal passando valor e código SAP após mensagem inicial', async () => {
            await postTextMessage('@@start_conversation##');
            const {replies} = await postTextMessage('quero alerar o item 2171545 para 3,99');
            expect(replies).toHaveLength(1);
            expect(replies[0]).toMatchObject({
                "type": "action",
                "payload": {
                    "action": "normal_price.validate",
                    "context": {
                        "itemSapCode": "000000000002171545"
                    }
                }
            });
        });

        test('retorno de validacao de codigo SAP para mudanca de preco normal com SUCESSO', async () => {
            // isto deve definir a conversa para o dialogo correto
            await postTextMessage('mudar preço normal um item para 20 reais de sap 2134567');

            const postedAction = {
                "action": "normal_price.validation",
                "messages": [
                    {
                        "code": 100,
                        "text": "sucesso!"
                    }
                ]
            };

            const {replies} = await postActionMessage(postedAction);
            expect(replies).toHaveLength(1);
            expect(replies[0]).toMatchObject({"payload": "Ok. Deseja alterar o valor do item 2134567 para R$ 20,00?", "type": "text"});
        });

        test('retorno de validacao de codigo SAP para mudanca de preco normal com ERRO', async () => {
            // isto deve definir a conversa para o dialogo correto
            await postTextMessage('mudar preço normal um item para 20 reais de sap 2134567');

            const postedAction = {
                "action": "normal_price.validation",
                "messages": [
                    {
                        "code": 302,
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
                "payload": "O item 321, do departamento 987, não foi alterado porque você não tem acesso a esse departamento."
            });
        });

        test('confirmação POSITIVA de mudar preço normal', async () => {
            // isto deve definir a conversa para o dialogo correto
            await postTextMessage('mudar preço normal um item para 20,99 reais de sap 2131514');
            await postActionMessage({
                "action": "normal_price.validation",
                "messages": [
                    {
                        "code": 100,
                        "text": "sucesso!"
                    }
                ]
            });

            const {replies, ...rest} = await postTextMessage('sim');
            expect(replies).toHaveLength(1);
            expect(replies[0]).toMatchObject({
                "type": "action",
                "payload": {
                    "action": "normal_price.send",
                    "content": "Suas alterações estão em processamento.",
                    "context": {
                        "codSap": '000000000002131514',
                        "valor": 20.99
                    }
                }
            });
        });

        test('confirmação NEGATIVA de mudar preço normal', async () => {
            // isto deve definir a conversa para o dialogo correto
            await postTextMessage('mudar preço normal um item para 20 reais de sap 2134567');
            await postActionMessage({
                "action": "normal_price.validation",
                "messages": [
                    {
                        "code": 100,
                        "text": "sucesso!"
                    }
                ]
            });

            const {replies, ...rest} = await postTextMessage('não');
            expect(replies).toHaveLength(1);
            expect(replies[0]).toMatchObject({
                "type": "text",
                "payload": "Ok. Se precisar de mais alguma ajuda, estarei à disposição."
            });
        });
    });

    describe('Alteração de preço sem tipo definido', () => {
        test('Alteração preço sem tipo', async () => {
            const {replies} = await postTextMessage('alterar preço');
            expect(replies).toHaveLength(2);
            expect(replies[0]).toMatchObject({"payload": "Para alterar o preço normal é só me dizer o item e o preço, ou baixar este arquivo aqui e me enviar de volta", "type": "text"});
            expect(replies[1]).toMatchObject({"payload": {"action": "normal_price.more_info"}, "type": "action"});
        });
    });


});
