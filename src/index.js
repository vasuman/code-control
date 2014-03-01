(function() {
  var Range, clearOutput, demoShowOutput, editors, aetherInput, grabDemoCode, lastAetherInput, lastJSInputAether, lastProblems, loadExample, oldConsoleLog, showProblems, watchForCodeChanges;

  editors = [];

  Range = ace.require("ace/range").Range;

  $(function() {
    $(".ace-editor-wrapper").each(function() {
      var editor;
      editor = ace.edit(this);
      editor.setTheme("ace/theme/xcode");
      editor.getSession().setUseWorker(false);
      editor.getSession().setMode("ace/mode/javascript");
      editor.getSession().getDocument().on("change", watchForCodeChanges);
      return editors.push(editor);
    });
    loadConfig();
  });

  grabDemoCode = function() {
    return editors[0].getValue() ;
  };

  lastProblems = null;

  showProblems = function(aether) {
    var allProblems, ann, annotations, editor, level, problem, problemIndex, problems, session, text, worst, wrapper, _ref;
    if (_.isEqual(aether.problems, lastProblems)) {
      return;
    }
    lastProblems = aether.problems;

    for (level in aether.problems) {
      problems = aether.problems[level];
      for (problemIndex in problems) {
        problem = problems[problemIndex];
        if (problem.serialize) {
          problems[problemIndex] = problem.serialize();
        }
      }
    }

    editor = editors[0];
    session = editor.getSession();
    annotations = [];
    allProblems = aether.getAllProblems();
    for (problemIndex in allProblems) {
      problem = allProblems[problemIndex];
      if (((_ref = problem.ranges) != null ? _ref[0] : void 0) == null) {
        continue;
      }
      ann = {
        row: problem.ranges[0][0].row,
        column: problem.ranges[0][0].col,
        raw: problem.message,
        text: problem.message,
        type: problem.level || "error"
      };
      annotations.push(ann);
    }
    session.setAnnotations(annotations);
    wrapper = $("#worst-problem-wrapper").empty();
    worst = allProblems[0];
    if (worst) {
      text = worst.type + " " + worst.level;
      text += ": " + worst.message;
      wrapper.text(text);
      wrapper.toggleClass("error", worst.level === "error");
      wrapper.toggleClass("warning", worst.level === "warning");
      return wrapper.toggleClass("info", worst.level === "info");
    }
  };

  demoShowOutput = function(aether) {
    showProblems(aether);
  };

  clearOutput = function() {
    $("#aether-console").text("");
  };

  lastJSInputAether = new Aether();

  lastAetherInput = "";

  watchForCodeChanges = function() {
    var aetherInput, code;
    aetherInput = editors[1].getValue();
    code = grabDemoCode();
    if (!Aether.hasChangedSignificantly(code, lastJSInputAether.raw) && aetherInput === lastAetherInput) {
      return;
    }
    clearOutput();
    lastAetherInput = aetherInput;
    lastJSInputAether.transpile(code);
    return eval(aetherInput);
  };

  watchForCodeChanges = _.debounce(watchForCodeChanges, 1000);

  oldConsoleLog = console.log;

  console.log = function() {
    var ac, newText, oldText;
    oldConsoleLog.apply(console, arguments);
    ac = $("#aether-console");
    oldText = ac.text();
    newText = oldText + Array.prototype.slice.call(arguments).join(" ") + "\n";
    return ac.text(newText).scrollTop(ac.prop('scrollHeight'));
  };

  loadConfig = function() {
    editors[1].setValue(aetherInput.options);
  };

  aetherInput = {
    options: 'var aetherOptions = {\n  thisValue: {say: console.log},\n  problems: {jshint_W040: {level: "ignore"}}\n};\nvar aether = new Aether(aetherOptions);\nvar code = grabDemoCode();\naether.transpile(code);\naether.run();\naether.run();\naether.run();\ndemoShowOutput(aether);'
  };

}).call(this);
