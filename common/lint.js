const DEFAULT_ATTACK_CODE = "function attack(params) {\n // TODO: insert attack code here\n return {action: 'rest'};}";
const DEFAULT_DEFEND_CODE = "function defend(params) {\n // TODO: insert defend code here\n return {action: 'rest'};}";

var options = {
    undef: true,
    noarg: true,
    freeze: true,
    latedef: true
}
var attack_and_defend_code = [ DEFAULT_DEFEND_CODE, DEFAULT_ATTACK_CODE]
const ATTACK_FUNCTION = 'attack',
	  DEFEND_FUNCTION = 'defend';

function makeMap(x) {
    var m = {}, i;
    for(i = 0; i < x.length; i++) {
        m[x[i].name] = false;
    }
    return m;
}

function truthize(x) {
    var key, res = {};
    for(key in x) {
        if(x.hasOwnProperty(key)) {
            res[key] = true;
        }
    }
    return res;
}

function getFunctionCode(code, name, lineInfo) {
	var codeLines = code.split('\n'),
		functionCode = '';

	// Assume lineInfo is just as needed.
	/*
	 * lineInfo = {
		 * line: ,
		 * character: ,
		 * last: ,
		 * lastcharacter: ,
	 * };
	 */

	if (lineInfo.last === lineInfo.line) {
		var line = codeLines[lineInfo.line - 1];
		var functionString = line.substring(lineInfo.character, lineInfo.lastcharacter - 1);

		for (var i = lineInfo.character - 2; i >= 0; i--) {
			if (line.charAt(i) === '(')
				break;
		}

		functionString = line.substring(i, lineInfo.character) + functionString;
		functionString = 'function ' + name + functionString;
		return functionString;
	}

	var line = codeLines[lineInfo.line - 1];
	var firstLine = line.substring(lineInfo.character, line.length);

	var i = 0;
	for (i = lineInfo.character - 2; i >= 0; i--)
		if (line.charAt(i) === '(')
			break;

	firstLine = 'function ' + name + line.substring(i, lineInfo.character) + firstLine;
	functionCode = firstLine + '\n';

	for (i = lineInfo.line; i < lineInfo.last - 1; i++) {
		line = codeLines[i];
		functionCode = functionCode + line + '\n';
	}

	// Now for the last line;
	i = lineInfo.last - 1;
	line = codeLines[i];
	functionCode = functionCode + line.substring(0, lineInfo.lastcharacter - 1);

	return functionCode;
}

// Returns object if function is present. Else returns 0.
function getLineData(functionArray, name) {
	var lineInfo = {},
		funcPresent = false;

    functionArray.forEach(function(func){
        if (func.name === name) {
            funcPresent = true;
            lineInfo.line = func.line;
            lineInfo.character = func.character;
            lineInfo.last = func.last;
            lineInfo.lastcharacter = func.lastcharacter;
        }
    });
	if (funcPresent)
		return lineInfo;
	else 
		return 0;
}

// This function returns 'empty' if the code isn't there. Else, it returns the code.
// name is the name of the function
// code is the overall code
// globals is the 'common + defend + attack' api file
function getCode(code, globals, name) {
	var jsHintExport = require('jshint').JSHINT,
		res = jsHintExport(code, options, truthize(globals));

	var functionData = jsHintExport.data().functions;

	var lineInfo = getLineData(functionData, name); 
	if (lineInfo === 0) {
		return 'empty';
	}

	var functionCode = getFunctionCode(code, name, lineInfo);
	return functionCode;
}
function array_to_bool_dict(array){
	var dict = {}
	array.forEach(function(el){
		dict[el] = true;
	});
	return dict;	
}
const EraseGlobals = true;
const ValidGlobalsList = ['Array', 'Math', 'Function', 'Object', 'String', 'Infinity', 'NaN', 'undefined', 'null', 'Boolean', 'Symbol', 'Error', 'EvalError', 'InternalError', 'RangeError', 'ReferenceError', 'SyntaxError', 'TypeError', 'URIError', 'Number', 'Math', 'Date', 'RegExp', 'Int8Array', 'Uint8Array', 'Uint8ClampedArray', 'Int16Array', 'Uint16Array', 'Int32Array', 'Uint32Array', 'Float32Array', 'Float64Array', 'Map', 'Set', 'WeakMap', 'WeakSet', 'ArrayBuffer', 'SharedArrayBuffer', 'Atomics', 'DataView', 'JSON', 'Promise', 'Generator', 'GeneratorFunction', 'Reflect', 'Proxy', 'arguments' ];
var validGlobalsDict = array_to_bool_dict(ValidGlobalsList);	// Too lazy to modify ValidGlobalsList

function versusProcess(code, globalsArr, req_func) {
    /*
        Allows only required functions as global variables, nothing more.

        params code         :User's code. A single string of 
                             attack and defend code actually
        params globalsArr   [api, attack_api, defend_api]
        params req_func     :['attack','defend']
        

    */
	if (globalsArr.length < 3)
		throw new Error('Globals doesn\'t have enough elements!');

	var warn = process(code, globalsArr[0], req_func);
	var globals = truthize(globalsArr[0]);
	var jsHintExport = require('jshint').JSHINT,
		res = jsHintExport(code, options, globals);
	var functionData = jsHintExport.data().functions;
	var jsHintData = jsHintExport.data();
	
	// discard all the invalid global functions
    var req_func_dict = array_to_bool_dict(req_func);
    jsHintData.globals.forEach(function(glob){
    	if(!(globals[glob] || (glob in req_func_dict) || (glob in validGlobalsDict))){
  			warn.push({ 
                row: 0, 
                text: glob + ' can not be used',
                column: 1,
                type: 'warning',
                raw: 'Invalid access to function'
            });	
    	}
    });

	var warnIndex = warn.length;
	for (var j = 0; j < req_func.length; j++) {
		var lineInfo = getLineData(functionData, req_func[j]); 
		if (lineInfo === 0) {
			continue;
			warn.push({
				row: 0,
				text: 'Function ' + req_func[j] + ' is not defined',
				column: 1,
				type: 'warning',
				raw: 'Required function not defined'
			});
		}

		var childCode = getFunctionCode(code, req_func[j], lineInfo);
		var childWarn = process(childCode, globalsArr[j + 1], [req_func[j]]);
        attack_and_defend_code[j] = childCode;  // 0->defend, 1-> attack
		warn = warn.concat(childWarn);

		if (warn.length > warnIndex) {
			for (var i = warnIndex; i < warn.length; i++) {
				var warnMessage = warn[i];
				warnMessage.row += lineInfo.line - 1;
			}
			warnIndex = warn.length;
		}
	}
	return warn;
}

function process(code, globals, req_func) {
	globals = truthize(globals);
	var j = require('jshint').JSHINT, i,
    res = j(code, options, globals), warn = [], errors, f;
    if(!res) {
        var errors = j.data().errors, e;
        for(i = 0; i < errors.length; i++) {
            e = errors[i];
            warn.push({ 
                row: e.line - 1, 
                text: e.reason, 
                raw: e.reason, 
                column: e.character,
                type: 'error'
            });
        }
    } else {
        if(req_func) {
            var f = makeMap(j.data().functions);
            for(i = 0; i < req_func.length; i++) {
                // attack and defend must be present in player's code
                if(!(req_func[i] in f)){
                    warn.push({ 
                        row: 0, 
                        text: 'Function ' + req_func[i] + ' is not defined',
                        column: 1,
                        type: 'warning',
                        raw: 'Required function not defined'
                    });
                }
            }
        }
    }
    return warn;
}
module.exports.process = process;
module.exports.versusProcess = versusProcess;
module.exports.getFunctionCode = getCode;
module.exports.adCode = attack_and_defend_code
