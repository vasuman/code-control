var vm = require('vm'),
util = require('./simulation/util'),
child_proc = require('child_process');

function TimeoutException() {};
const INIT = 0, DONE = 1, RUN = 2, KILLED = 3;
function Runner(api, code, errBack, initTimeout, n) {
    var ctx = vm.createContext(api),
    proc = [], cback = [],
    i, turn = 0;

    function timeoutKill(i) {
        return function() {
            if (proc[i].state != KILLED){
                proc[i].p.kill('SIGKILL');
                if(proc[i].state == INIT) {
                    errBack(i, new TimeoutException);
                } else if(proc[i].state == RUN) {
                    proc[i].callback(false, new TimeoutException)
                }
                proc[i].state = KILLED;
            }
        }
    }

    function messageHandler(i) {
        return function(type, data) {
            proc[i].state = DONE;
            if(type == 'init_done') {
                cancelTimeout(proc[i].timeout);
            } else if(type == 'result') {
                cancelTimeout(proc[i].timeout);
                proc[i].callback(true, data);
                proc[i].callback = null;
            } else if(type == 'error') {
                if(proc[i].state == INIT) {
                    errBack(i);
                } else if(proc[i].state == RUN) {
                    proc[i].callback(false, data);
                }
            }
        }
    }

    for(i = 0; i < n; i++) {
        proc[i] = {};
        proc[i].p = child_proc.fork('./simulation/sandbox.js');
        proc[i].p.on('message', messageHandler(i));
        proc[i].p.send('id', i);
        proc[i].p.send('context', util.copy(api));
        proc[i].state = INIT;
        proc[i].timeout = setTimeout(timeoutKill(i), initTimeout);
        proc[i].p.send('init_code', code[i]);
    }

    function runCode(i, input, cback, f_name) {
        if(proc[i].state != DONE) {
            throw new Error('Invalid state call');
        }
        proc[i].callback = cback;
        proc[i].state = RUN;
        proc[i].p.send('load_param', input);
        proc[i].p.send('run_code', f_name);
    }
    this.runCode = runCode;
}

module.exports.Runner = Runner;
module.exports.TimeoutException = TimeoutException;
