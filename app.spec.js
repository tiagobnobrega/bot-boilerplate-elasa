const axios = require('axios');
require('dotenv').config();

const PORT = process.env.PORT || 80;
const BASE_URL = 'http://localhost';

const axiosClient = axios.create({
    baseURL: `${BASE_URL}${PORT && PORT !== 80 ? ':' + PORT : ''}`,
    timeout: 10000,
    // headers: {'X-Custom-Header': 'foobar'}
});

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
        conosle.error(e);
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

console.info("Don't forget to start local server with 'yarn start' command.");

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
        test('mudar preço sem definir tipo',async ()=>{});

        test('mudar preço normal passando SEM passar SAP ou valor',async ()=>{});

        test('mudar preço normal passando apenas o código SAP',async ()=>{});

        test('mudar preço normal passando apenas o valor',async ()=>{});

        test('mudar preço normal passando valor e código SAP',async ()=>{});

        test('retorno de mudar preço normal com erro de validação',async ()=>{});

        test('retorno de mudar preço normal SEM erro de validação',async ()=>{});

        test('confirmação de mudar preço normal',async ()=>{});

    });

});