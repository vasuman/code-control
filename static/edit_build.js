var editor, session, saveButton, resultDiv, saveDiv;

function init() {
    editor = ace.edit("editor");
    editor.setFontSize(19);
    editor.setTheme('ace/theme/chrome');
    session = editor.getSession();
    session.setUseWorker(false);
    session.setMode("ace/mode/javascript");
    session.getDocument().on('change', function() {
        saveDiv.innerHTML = 'NOT SAVED';
    });
    saveButton = document.getElementById('save-button');
    saveButton.addEventListener('click', save);
    resultDiv = document.getElementById('flag-div');
    saveDiv = document.getElementById('save-div');
}

function makeMap(errors) {
    var res = {};
    errors.forEach(function(error) {
        res[error.row] = error;
    });
    return res;
}

function doneSave() {
    if(this.status != 200) {
        console.log('Server Error');
    } else {
        console.log(this.response);
        var resp = JSON.parse(this.response);
        if(resp.status == 0) {
            console.log('Success');
            editor.getSession().setAnnotations([]);
            resultDiv.innerHTML = 'OK';
        } else if(resp.status == 1) {
            console.log('Server W');
        } else if(resp.status == 2) {
            console.log('Error');
            editor.getSession().setAnnotations(resp.errors);
            resultDiv.innerHTML = 'FAIL'
        }
        saveDiv.innerHTML = 'saved';
    }
    setButtonState(true);
}

function sendCode(code) {
    var saveXhr = new XMLHttpRequest;
    saveXhr.onload = doneSave;
    saveXhr.open('POST', 'save', true);
    saveXhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    saveXhr.send('code=' + code);
}

function save() {
    setButtonState(false);
    var code = session.getValue();
    sendCode(code);
}

function pass() {}

function setButtonState(val) {
    saveButton.disabled = !val;
}
window.save = save;
window.pass = pass;
window.onload = init;
