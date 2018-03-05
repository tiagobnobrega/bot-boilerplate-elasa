const Context = require('../lais/index').Context;

class ContextManager {
  constructor() {
    this.contexts = {};
  }

  getContext(contextId) {
    let context = this.contexts[contextId];

    if(!context || context.isExpired()) {
      context = this.contexts[contextId] = new Context({ contextId: contextId });
    }

    return context;
  }

  setContext(contextId, context) {
    this.contexts[contextId] = context;
  }

  clearAll() {
    this.contexts = {};
  }
}

module.exports = ContextManager;