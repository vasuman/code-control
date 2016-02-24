# Code elements in detail

### Point

A constructor that simplifies creation of `i`, `j` objects
    
    var p = new Point(0, 0);
    console.log(p);

    /* OUTPUT */
    {
        i: 0,
        j: 0
    }

### Direction

An object containing constants representing the 4 directions,

    const Direction = {
        U: 0,   // Up
        D: 1,   // Down
        L: 2,   // Left
        R: 3    // Right
    }


### Attack and Defend

`attack` and `defend` are the two entry points for your code. Those are the only functions that are actually called during the simulation. Anything declared outside `attack` and `defend` will be discarded and will throw an `error` during `linting`or `saving` the code.
> Note that `attack` and `defend` are two independent functions that handle your `attack` and `defend` simulations respectively. Your code must have both `attack` and `defend` functions.


#### Return Value

The return value from `attack` and `defend` functions is an `Object`  that determines the `action` your character performs.
The **compulsory** key that your return object must posses is the `action` key. This key can be any one of :

**rest**

Does *nothing* for that turn.

    function attack(params) {
        return { action: 'rest' }    
    }

> Any additional keys are ignored if action is `rest`.

**move**

Attempts to move in the particular `Direction`. If the new position is invalid -- out of bounds; or already occupied, the `move` *fails*.
This action **requires** an additional `dir` key which specifies the [Direction](api.html#direction) to move in.

    function attack(params) {
        return {
            action: 'move',
            dir: Direction.U
        }
    }

**attack**

If an entity is present *one* tile away in the `Direction` `dir` from the current position. The other character is `damaged`.

    function attack(params) {
        return {
            action: 'attack',
            dir: Direction.D
        }
    }
In the above code snippet, if an enemy is one tile downwards from you then you perform an attack.

#### Entity

An entity is just a plain old Javascript `Object` that describes well, an *entity*. Its keys describe its state. Available keys are :

* *idx*: A unique `id` that identifies each entity.
* *team*: A number that identifies which team the entity belongs to.
* *pos*: A `Point` object that describes its position on the grid.
* *health*: The remaining health of the entity.

#### Parameters or `params`

Your `attack` and `defend` functions are supplied with a bunch of parameters that specify the current game state. All of these parameters are encapsualted into a single `params` object. All parameters are accesible via the *keys* of this object that are :

***params.self***

An `entity` object that describes the **character that is being updated**.

***params.grid***

Keys,
* `arr` 1D row major representation of *game grid*
* `row` number of rows
* `col` number of columns
A one dimensional `Array` that represents the entire *game grid* at the current instant. The API provides a utility `getAt` function to help seeking using `i`, `j` indexing. 

> Modifying these parameters *doesn't* change the game state. You can *only* affect the state by *returning* an `action` and update your character.

***params.entities***

An `Object` consisting of all the *entities* currently present on the map including you.


### isValid

*Parameters*: `params`, `point`

Function that returns whether a certain point is within the bounds of the map.
`params` has details about entities and is made available as an argument to both `attack` and `defend` functions.


    Imagine a map is 4 X 4 matrix. Then,
    `isValid(params, new Point(1, 2))` // returns True value
    `isValid(params, new Point(5, 3))` // returns False value


### getAt

*Parameters*: `params`, `point`

Function that returns an `Object` at the given `point` on the map.
The object may be either an *entity* or a *tile* or value `0` if it's free.
Type can be determined via `getType`

### getDistance

*Parameters*: `pointA`, `pointB`

Function that returns the [Manhattan distance](http://en.wikipedia.org/wiki/Taxicab_geometry) between two points

### getDirection

*Parameters*: `pointA`, `pointB`

Function that gets the *direction* of the maximum difference between `pointB` and `pointA`. Returns `-1` if both are same;

### getEntArray

*Parameters*: `params`

Function that returns the entities on the map as an `Array`

### getType

*Parameters*: `object`

Function that returns the *type* of object from the return value of `getAt` or `none` if it's empty.

### getMove

*Parameters*: `point`, `dir`

Function that returns the point you reach when you move in direction `dir` from `point`.
Note that `point` and `dir` has to be an instance of `Point` and `Direction` objects respectively.

    `
       var new_pos = getMove(point, Direction.U) 
       // returns a `Point` object. `new_pos.i`, `new_pos.j` are the index for new positions.
    `

Note that the APIs' won't change a state of any object. If you want to change the state, then return a result object with `action` key. For example, you can use `getMove` to get the new position and if the new position is suitable for you then just return an `action` with value `move` and `dir` with the direction you passed in `getMove` to actually move to the new position.
