var vm = require('vm'),
ctx = {}, code, ctors = {};

function deepFreeze (o) {
    var prop, propKey;
    Object.freeze(o);
    for (propKey in o) {
        prop = o[propKey];
        if (!o.hasOwnProperty(propKey) || !(prop instanceof Object) || Object.isFrozen(prop)) {
            continue;
        }
      deepFreeze(prop);
    }
}

function handleMessage(m) {
    var type = m.type,
    data = m.data,
    update_code, api;
    if(type == 'init_context') {
        api = require(data);
        deepFreeze(api)
        ctx = vm.createContext(require(data));
        ctx.param = {};
        ctx.result = {};
        Object.seal(ctx);
    } else if(type == 'load_param') {
        ctx.param = data;
    } else if(type == 'init_code') {
        try {
            vm.runInContext(data, ctx);
            process.send({ type: 'init_done', data: null });
        } catch(e) {
            process.send({ type: 'error', data: e.message });
        }
    } else if(type == 'run_code') {
        update_code = 'result = ' + data +'(param);';
        try {
            vm.runInContext(update_code, ctx);
            process.send({ type: 'result', data: ctx.result});
        } catch(e) {
            process.send({ type: 'error', data: e.message });
        }
    }
}
process.on('message', handleMessage);
