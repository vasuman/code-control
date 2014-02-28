var vm = require('vm'),
ctx = {}, code;
function handleMessage(type, data) {
    var update_code;
    if(type == 'context') {
        ctx = vm.createContext(data);
    } else if(type == 'load_param') {
        ctx.param = data;
    } else if(type == 'init_code') {
        vm.runInContext(data, ctx);
        process.send('init_done', null);
    } else if(type == 'run_code') {
        update_code = 'result = ' + data +'(param);';
        try {
            vm.runInContext(update_code, ctx);
            process.send('result', ctx.result);
        } catch(e) {
            process.send('error', e);
        }
    }
}
process.on('message', handleMessage);
