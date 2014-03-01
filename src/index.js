// Modules
//var aether = require('aether'); Y the F its not on npm??????? 

// DOM Elements
var dom = {
  hud: document.getElementById('hud'),
  editor: document.getElementById('javascript-input')
}

module.exports = Editor

function Editor() {
 var Range = ace.require('ace/range').Range, editor;

 editor = ace.edit(dom.editor);
 editor.setTheme('ace/theme/xcode');
 editor.getSession().setUseWorker(false);
 editor.getSession().setMode('ace/mode/javascript');
 //editor.getSession().getDocument().on('change', watchForCodeChanges);

 return editor;
}

// Start
new Editor