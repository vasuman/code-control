# Introduction

**Code Character** is a versus event. Your aim is to code a character and defeat the other player.

## Objective

You create a *character* which is controlled by a **single** entry point, the `update` loop.

    function update(params) {
        // Do stuff here
    }

The `update` loop is executed each turn for your character with some `params` that represent the current state of the game.

## Scoring

Once you have coded your character and submitted it. You can challenge other players' characters.
Then, a match is simulated between your two characters and the winner is awarded a certain number of points.
The final winners are decided based on who has the *most* number of points.

## Language

The chosen implementation language is [Javascript](https://developer.mozilla.org/en/docs/Web/JavaScript) chosen for it's specific ease of use. Also being an interpreted, scripting language with *no* static typing it offers several coding speed benefits.

### Environment

All submitted code is executed in a sandboxed environment so, the standard browser `document` and `window` objects are *not* present. There are *no* module loaders like `require` either.

The standard language features like,
* `Object`
* `Array`
* `Math`

etc. *are* accessible.

### Linting
For safety checking we employ some basic [code linting](http://en.wikipedia.org/wiki/Lint_%28software%29). Things to ensure,

+ **No access of undeclared global variables**


    var b;
    function update(params) {
        b = 2;  /* GUD */
        a = 1;  /* BAD */
    }


+ **No modification of provided API objects**


    function update(params) {
        Point.x = 1;    /* NO */
    }


+ **No modification of `prototype` of inbuilt objects**


    function update(params) {
        Array.prototype.toString = function() {
            return 'I am a 1337 h@xx0r'    /* NOPE */
        }
    }
