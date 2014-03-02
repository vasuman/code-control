var options = {
    undef: true,
    noarg: true,
    freeze: true,
    latedef: true
}

function makeMap(x) {
    var m = {}, i;
    for(i = 0; i < x.length; i++) {
        m[x[i]] = false;
    }
    return m;
}

function process(code, globals, req_func) {
    var j = require('jshint').JSHINT, i,
    res = j(code, options, globals), warn = [], errors, f;
    if(!res) {
        var errors = j.data().errors, e;
        for(i = 0; i < errors.length; i++) {
            e = errors[i];
            warn.push({ line: e.line, reason: e.reason });
        }
    } else {
        if(req_func) {
            var f = makeMap(j.data().functions);
            for(i = 0; i < req_func.length; i++) {
                if(!(req_func[i] in f)) {
                    warn.push({ 
                        line: 1, 
                        reason: 'Function ' + req_func[i] + ' is not defined'
                    });
                }
            }
        }
    }
    return warn;
}
module.exports.process = process;
