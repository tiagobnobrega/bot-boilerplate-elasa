const _ = require("lodash");
const vm = require('vm');
const RTCompiler = function(args){
    const sandbox = vm.createContext(_.merge(args,{module:{exports:null}}));
    const me = {};
    me.require = function(code) {
        if(!(typeof code === "string")) throw new Error(`Cannot compile code ${code}. Only strings allowed`);
        sandbox.module.exports = null;
        vm.runInNewContext(code,sandbox);
        return sandbox.module.exports;
    };
    me.compileAttributes = (obj,...attrs)=>{
        attrs.forEach((attr)=>{
            let attrVal = obj[attr];
            if(!attrVal) return;
            if(!(typeof attr === "string")) throw new Error(`Cannot compile attribute ${attr}. Only strings allowed`);
            let code = `module.exports = ${attrVal}`;
            obj[attr] = me.require(code);
        })
    };
    return me;
};
module.exports = RTCompiler;