var vm = require('vm'),
linter = require('../common/lint.js'),
child_proc = require('child_process');

function SandboxException(i, m) {
    this.m = m;
    this.i = i;
}
SandboxException.prototype.toString = function() {
    return 'SBOX_ERR: P_' + this.i + ' - ' + this.m;
}

function TimeoutException() { }

TimeoutException.prototype.toString = function() {
    return "Subprocess timed out";
}

const INIT = 0, DONE = 1, RUN = 2, KILLED = 3;
function Runner(api, code, cBack, errBack, timeLimit) {
    var proc = [], cback = [], i;

    function timeoutKill(i) {
        return function() {
            if (proc[i].state != KILLED) {
                proc[i].p.kill('SIGKILL');
                if(proc[i].state == INIT) {
                    setImmediate(errBack, i, new TimeoutException);
                } else if(proc[i].state == RUN) {
                    var e = new TimeoutException;
                    setImmediate(proc[i].callback, false, e);
                }
                proc[i].state = KILLED;
            }
        }
    }

    function messageHandler(i) {
        return function(m) {
            var type = m.type, data = m.data;
            if(type == 'init_done') {
                clearTimeout(proc[i].timeout);
                proc[i].state = DONE;
                setImmediate(cBack);
            } else if(type == 'result') {
                clearTimeout(proc[i].timeout);
                proc[i].callback(true, data);
                proc[i].state = DONE;
            } else if(type == 'error') {
                if(proc[i].state == INIT) {
                    setImmediate(errBack, i, new Error(data))
                } else if(proc[i].state == RUN) {
                    var e = new SandboxException(i, data);
                    setImmediate(proc[i].callback, false, e);
                }
                proc[i].state = DONE;
            }

            if(proc[i].q.length > 0) {
                runCode.apply(this, proc[i].q.pop());
            }
        }
    }

    function appendToLog(i) {
        return function(data) {
            proc[i].log += data;
        }
    }

    for(i = 0; i < code.length; i++) {
        var err = linter.process(code[i], require(api), ['update']);
        if(err.length > 0) {
            setImmediate(errBack, i, new Error('Code failed to lint ' + err[0].reason));
            return;
        }
        proc[i] = {};
        proc[i].q = [];
        proc[i].log = '';
        proc[i].p = child_proc.fork('./simulation/sandbox.js', [], {silent: true});
        proc[i].p.on('message', messageHandler(i));
        proc[i].p.send({ type: 'init_context', data: api });
        proc[i].state = INIT;
        proc[i].timeout = setTimeout(timeoutKill(i), timeLimit);
        proc[i].p.send({ type: 'init_code', data: code[i] });
        proc[i].p.stdout.on('data', appendToLog(i));
    }

    function runCode(i, input, cback, f_name, timeLimit) {
        if(proc[i].state != DONE) {
            proc[i].q.push(arguments);
        }
        proc[i].state = RUN;
        proc[i].callback = cback;
        proc[i].p.send({ type: 'load_param', data: input });
        proc[i].timeout = setTimeout(timeoutKill(i), timeLimit);
        proc[i].p.send({ type: 'run_code', data: f_name });
    }
    this.runCode = runCode;

    function flushStr(i) {
        var res = proc[i].log;
        proc[i].log = '';
        return res;
    }
    this.flushStr = flushStr;
}

module.exports.Runner = Runner;
module.exports.TimeoutException = TimeoutException;
