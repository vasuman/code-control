### Introduction

**Code Control** is a versus event. Your aim is to code a character and defeat the other player.

### Objective

Each match has two rounds, `defend` and `attack`. To play a match you create a *character* which is controlled by a **double** entry point, the `attack` and `defend` loop. Your `defend` and `attack` codes are run against `attack` and `defend` codes of other opponent respectively. Refer [api](#api) for more details.

### A little about Game

Basically, there are two modes. `Training` and `Challenge`. 

* `Training` mode is when you test your code either by running against bot's code or by running against your own characters. Note that you can create multiple characters from your homepage. So if you want to compete with your own characters then just visit your homepage and choose a character to challenge it. To be able to challenge your own character's code, the character's code must pass a liniting test ( explained in next section ). The ability to challenge your own characters makes testing your code's standard fexible. For example, you can run a test with strong `attack` code of first character agains strong `defend` code of second character. This will give you a better idea about your code competency.  
Challenging your own characters won't affect the leaderboard. So feel free to experiment with your code in this round. Later you can see the preview of all your matches in homepage. You can challenge your characters any number of times.

* `Challenge` mode is when you get to actually challenge someone from leaderboard. You can challenge another player only if -
    * The difference between the two player's experience is `<=` 50.
    * The players do not have common owner.
    * The time difference between the consecutive game play is `2 minutes`.
Note that the above mentioned rules are not applicable for Training mode.

Assume there is a match where `Osama` challenged `Obama`. Now the match flow will be as below:

>**Round 1** : Osama is `defending` and Obama is `attacking`. In this round Osama's `defend` and Obama's `attack` function will be executed.

>**Round 2** :  Osama is `attacking` and Obama is `defending`. In this round Osama's `attack` and Obama's `defend` function will be executed.
Finally, the result is decided based on how their `attack` and `defend` codes performed. Wait a sec, we already know the result for this match. Don't we? Gosh! Moving ahead.


###### Note that ***Round 1*** and ***Round 2*** together make a single match

> We have inbuilt code editor for the game. You may edit your character's code from there. Your code has to pass the linting test before you can use it later.

### Scoring

Once you have coded your character and submitted it. You can challenge other players' characters.
Then, a match is simulated between your two characters and the winner is awarded a certain number of points. As mentioned before, challenging your own characters won't affect the leaderboard.
The final winners are decided based on who has the *most* number of points.

### Language

The chosen implementation language is [Javascript](https://developer.mozilla.org/en/docs/Web/JavaScript) chosen for it's specific ease of use. Also being an interpreted, scripting language with *no* static typing it offers several coding speed benefits.

### Environment

All submitted code is executed in a sandboxed environment so, the standard browser `document` and `window` objects are *not* present. There are *no* module loaders like `require` either.

The standard language features like,
* `Object`
* `Array`
* `Math`

etc. *are* accessible.

>Note that you can always edit your code. You need to be log in and then visit your character's page to be able to edit the code.


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