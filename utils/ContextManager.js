const Context = require('../lais/index').Context;

class ContextManager {
  constructor() {
    this.contexts = {};
  }

  getContext(contextId,initialContext) {
    let context = this.contexts[contextId];

    if(!context || context.isExpired()) {
      context = this.contexts[contextId] = new Context({ contextId: contextId,...initialContext });
    }

    return context;
  }

  setContext(contextId, context) {
    this.contexts[contextId] = context;
  }

  clearAll() {
    this.contexts = {};
  }

  static fromPlainObject(src){
      if(src instanceof Context) return src;
     return new Context(src);
  }
}

module.exports = ContextManager;
