# Introduction

**Code Control** is a versus event. Your aim is to code a character and defeat the other player.

## Objective

Each match has two rounds, `defend` and `attack`. To play a match you create a *character* which is controlled by a **double** entry point, the `attack` and `defend` loop. `function defend()` and `function attack()` executes the code for `defend` and `attack` rounds respectively. 

   ```javascript
    function attack(params) {
        // Write your attack code here
    }
    function defend(params){
        // Write your defend code here
    }
    ```

Here `params` represents the current state of the game and is the compulsory argument for `attack` and `defend`.
Assume there is a match between `Ashutosh` and `Juan`. Now the match flow will be as below:

>***Round 1*** : `Ashutosh` is `defending` and Juan is `attacking`. In this round Ashutosh's `attack` and Juan's `defend` function will be executed.

>***Round 2*** :  `Ashutosh` is `attacking` and Juan is `defending`. In this round Ashutosh's `defend` and Juan's `attack` function will be executed.


###### Note that ***Round 1*** and ***Round 2*** together make a single match

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

>Note that you can always edit your code. You need to be log in and then visit your character's page to be able to edit the code.

### A little about Game

Basically, there are two modes. `Training` and `Challenge`. `Training` phase is when you test your code by running it against bot's code or by running against your own characters. So if you want to compete with your own character then just visit your homepage and choose the character to challenge it. To be able to challenge your own character's code, the character's code must pass the liniting test(explained in next section). Note that challenging your own characters allows you to test your code's standard. This mode won't affect the leaderboard. So feel free to experiment with your code in this round. Later you can see the preview of all your matches in your homepage.
The second mode is Challenge mode. In challenge mode you get to actually challenge someone from leaderboard. You can challenge another player only if -
* The difference between the two player's experience is `<=` 50.
* The players do not have common owner.
* The time difference between the consecutive game play is `2 minutes`.


### Linting
For safety checking we employ some basic [code linting](http://en.wikipedia.org/wiki/Lint_%28software%29). Things to ensure,
***No access of undeclared global variables***
```
    var b ;
    function attack(params) {
        var a;
        b = 2;  /* BAD */
        a = 1;  /* GOOD */
    }
```
NOTE: You can use JavaScript globals like `Math`, `Array` etc.

***No declaration and access of any user defined global functions***
    function thisIsInvalidFunc(){
        return "Mind It";
    }
```
    function attack(params) {
        Array.prototype.toString = thisIsInvalidFunc();
    }
```
***No modification of provided API objects***
```
    function attack(params) {
        Point.x = 1;    /* NOT COOL BRO */
    }
```

***No modification of `prototype` of inbuilt objects***

```
    function attack(params) {
        Array.prototype.toString = function() {
            return 'I am a 1337 h@xx0r'    /* NOPE */
        }
    }
```
***If you want to define functions, then do it inside attack and defend. ***
Say, if you want to create a function `isThug` and use it inside `defend` then you can define it inside `defend` itself.

```
function attack(params) {
        function isThug(){
            return 1;
        }
        if(isThug()) return "Bye";
}
```