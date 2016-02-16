var options = {
    undef: true,
    noarg: true,
    freeze: true,
    latedef: true
}

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

// Done after appropriate linting
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

	for (var func in functionArray) {
		func = functionArray[func];
		if (func.name === name) {
			funcPresent = true;

			lineInfo.line = func.line;
			lineInfo.character = func.character;
			lineInfo.last = func.last;
			lineInfo.lastcharacter = func.lastcharacter;
		}
	}

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

// Will allow only required functions as global variables, nothing more.
const EraseGlobals = true;

// Assume req_func = ['attack','defend']
// globalsArr is essentially = ['common + attack + defend', 'common + attack', 'common + defend'] api
function versusProcess(code, globalsArr, req_func) {
	if (globalsArr.length < 3)
		throw new Error('Globals doesn\'t have enough elements!');

	var warn = [];

	warn = process(code, globalsArr[0], req_func);
	
	var jsHintExport = require('jshint').JSHINT,
		res = jsHintExport(code, options, truthize(globalsArr[0]));

	var functionData = jsHintExport.data().functions;
	var jsHintData = jsHintExport.data();
	// console.log(jsHintData);

	if (EraseGlobals) {
		for (var i = 0; i < jsHintData.globals.length; i++) {
			var name = jsHintData.globals[i];
			var nameIsIn = false;

			for (var j = 0; j < req_func.length; j++) {
				if (name === req_func[j]) {
					nameIsIn = true;
					break;
				}
			}
			
			if (!nameIsIn)
				warn.push({
					row: 0,
					text: name + ' should not be defined',
					column: 1,
					type: 'warning',
					raw: 'Extra global defined'
				});
		}
	}
	var warnIndex = warn.length;

	// Search and lint all required functions
	for (var j = 0; j < req_func.length; j++) {

		var lineInfo = getLineData(functionData, req_func[j]); 
		if (lineInfo === 0) {
			continue;
			// The below warning is taken care of in the first part.
			warn.push({
				row: 0,
				text: 'Function ' + req_func[j] + ' is not defined',
				column: 1,
				type: 'warning',
				raw: 'Required function not defined'
			});
		}

		var attackCode = getFunctionCode(code, req_func[j], lineInfo);
		// console.log(attackCode);
		var attackWarn;
		attackWarn = process(attackCode, globalsArr[j + 1], [req_func[j]]);
		warn = warn.concat(attackWarn);

		if (warn.length > warnIndex) {
			for (var i = warnIndex; i < warn.length; i++) {
				var warnMessage = warn[i];
				warnMessage.row += lineInfo.line - 1;
			}
			warnIndex = warn.length;
		}
	}

	/*
		lineInfo = getLineData(functionData, req_func[1]);
		if (lineInfo === 0) {
			warn.push({
				row: 0,
				text: 'Function ' + req_func[1] + ' is not defined',
				column: 1,
				type: 'warning',
				raw: 'Required function not defined'
			});
		}
		warnIndex = warn.length;

		var defendCode = getFunctionCode(code, req_func[1], lineInfo);
		console.log(defendCode);

		var defendWarn = warn.concat(process(defendCode, globalsArr[2], [req_func[1]]));
		warn = defendWarn;

		if (warn.length > warnIndex) {
			for (var i = warnIndex; i < warn.length; i++) {
				var warnMessage = warn[i];
				warnMessage.row += lineInfo.line - 1;
			}
			return warn;
		}
	*/

	return warn;
}

function process(code, globals, req_func) {
    var j = require('jshint').JSHINT, i,
    res = j(code, options, truthize(globals)), warn = [], errors, f;
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
                if(!(req_func[i] in f)) {
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
