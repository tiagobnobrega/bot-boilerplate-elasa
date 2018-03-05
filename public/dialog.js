var buildDefaultRules =function(){
return [
  {
    "scoreRule": {
      "intent": "saudacao",
      "saudacaoFeita": null
    },
    "action": {
      "reply": [
        "Olá, me chamo Lais.",
        "Em que posso ajudar?"
      ],
      "defineContext": {
        "saudacaoFeita": true
      }
    }
  },
  {
    "scoreRule": {
      "intent": "saudacao",
      "saudacaoFeita": true
    },
    "action": {
      "reply": [
        "Pois não"
      ]
    }
  },
  {
    "id": "problema_sist_qual_sistema",
    "scoreRule": {
      "intent": "problema_sistema",
      "entities": {
        "sistema": null
      }
    },
    "action": {
      "reply": [
        "Preciso saber de qual sistema você está falando. Em qual sistema você está com problema?"
      ],
      "defineContext": {
        "descobrindoSistema": true
      },
      "listenTo": [
        "entities"
      ]
    }
  },
  {
    "id": "problema_sist_qual_sistema_2",
    "fromNode": "problema_sist_qual_sistema",
    "priority": 1,
    "scoreRule": {
      "intent": "problema_sistema",
      "entities": {
        "sistema": null
      },
      "descobrindoSistema": true
    },
    "action": {
      "reply": [
        "Não reconheço esse sistema. Posso te ajudar apenas com o perecíveis ou chamado. Com qual destes sistema posso te ajudar ?"
      ],
      "defineContext": {
        "descobrindoSistema": true
      }
    }
  },
  {
    "id": "problema_sist_qual_sistema_3",
    "fromNode": "problema_sist_qual_sistema_2",
    "priority": 2,
    "scoreRule": {
      "intent": "problema_sistema",
      "entities": {
        "sistema": null
      },
      "descobrindoSistema": true
    },
    "action": {
      "reply": [
        "Infelizmente, não estou conseguindo entender sobre o que estava falando. Posso tentar te ajudar comalguma outra coisa?"
      ],
      "defineContext": {
        "descobrindoSistema": null,
        "intent": null,
        "entities": null
      },
      "listenTo": [
        "entities",
        "intent"
      ]
    }
  },
  {
    "id": "problema_sist_qual_topico",
    "scoreRule": {
      "intent": "problema_sistema",
      "entities": {
        "sistema": "pereciveis",
        "topico_pereciveis": null
      }
    },
    "action": {
      "reply": [
        "Qual dificuldade você está encontrando no pereciveis ?"
      ],
      "defineContext": {
        "descobrindotopico": true,
        "descobrindoSistema": null
      }
    }
  },
  {
    "id": "problema_sist_qual_topico_2",
    "fromNode": "problema_sist_qual_topico",
    "priority":1,
    "scoreRule": {
      "intent": "problema_sistema",
      "entities": {
        "sistema": "pereciveis",
        "topico_pereciveis": null
      }
    },
    "action": {
      "reply": [
        "Não sei se posso te ajudar com isso. Posso te ajudar com: login, baixa de item ou camera. "
      ]
    }
  },
  {
    "id": "problema_sist_qual_topico_3",
    "fromNode": "problema_sist_qual_topico_2",
    "priority": 2,
    "scoreRule": {
      "intent": "problema_sistema",
      "entities": {
        "sistema": "pereciveis",
        "topico_pereciveis": null
      }
    },
    "action": {
      "reply": [
        "Infelizmente, não estou conseguindo entender sobre o que estava falando. Posso tentar te ajudar comalguma outra coisa?"
      ],
      "defineContext": {
        "descobrindotopico": null,
        "intent": null,
        "entities": null
      },
      "listenTo": [
        "entities",
        "intent"
      ]
    }
  },
  {
    "scoreRule": {
      "intent": "problema_sistema",
      "entities": {
        "sistema": "pereciveis",
        "topico_pereciveis": "camera"
      }
    },
    "action": {
      "reply": [
        "Tente fazer isso para resolver seu problema com a camera",
        "posso te ajudar com mais alguma coisa?"
      ],
      "defineContext": {
        "solucaoProposta": true,
        "intent": null,
        "entities": null
      },
      "listenTo": [
        "entities",
        "intent"
      ]
    }
  },
  {
    "scoreRule": {
      "intent": "problema_sistema",
      "entities": {
        "sistema": "pereciveis",
        "topico_pereciveis": "baixa_item"
      }
    },
    "action": {
      "reply": [
        "Tente fazer isso para resolver seu problema com a baixa de item"
      ]
    }
  },
  {
    "scoreRule": {
      "intent": "problema_sistema",
      "entities": {
        "sistema": "pereciveis",
        "topico_pereciveis": "loja_associada"
      }
    },
    "action": {
      "reply": [
        "Tente fazer isso para resolver seu problema com a loja não associada"
      ]
    }
  },
  {
    "scoreRule": {
      "intent": "problema_sistema",
      "entities": {
        "sistema": "pereciveis",
        "topico_pereciveis": "sincronizacao"
      }
    },
    "action": {
      "reply": [
        "Tente fazer isso para resolver seu problema cdm a sincronizacao"
      ]
    }
  }
];
};
