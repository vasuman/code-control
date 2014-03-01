var vm = require('vm'),
ctx = {}, code;
function handleMessage(m) {
    var type = m.type,
    data = m.data,
    update_code;
    if(type == 'init_context') {
        ctx = vm.createContext(data);
    } else if(type == 'load_param') {
        ctx.param = data;
    } else if(type == 'init_code') {
        try {
            vm.runInContext(data, ctx);
            process.send({ type: 'init_done', data: null });
        } catch(e) {
            process.send({ type: 'error', data: e });
        }
    } else if(type == 'run_code') {
        update_code = 'result = ' + data +'(param);';
        try {
            vm.runInContext(update_code, ctx);
            process.send({ type: 'result', data: ctx.result});
        } catch(e) {
            process.send({ type: 'error', data: { n: e.name, m: e.message, s: e.stack } });
        }
    }
}
process.on('message', handleMessage);
