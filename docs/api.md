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


### Return Value

The return value from `attack` and `defend` functions is an JSON Object that determines the `action` your character performs. This object is of the format

    {
        action: ,
        dir: 
    }

The `action` key is **necessary**. It will be used to return the action your character performs.

Note that the function `attack` can return certain values that are ignored when returned through `defend`.

#### Common Return Values

The `action` key can take any of the following values

**rest**

Does *nothing* for that turn.

    function attack(params) {
        return { action: 'rest' }    
    }

> Any additional keys are ignored if action is `rest`.

**move**

Attempts to move in the particular `Direction`. If the new position is invalid -- out of bounds; or already occupied by another warrior, the `move` *fails*.
This action **requires** an additional `dir` key which specifies the [Direction](api.html#direction) to move in.

    function defend(params) {
        return {
            action: 'move',
            dir: Direction.U
        }
    }

#### Attacker Return Values

The following return values are valid only in `attack`. In `defend`, they are synonymous to `rest`.

**attack**

This return type is ignored when returned through the `defend` function.

If an entity is present *one* tile away in the `Direction` `dir` from the current position. The other entity is then killed.

    function attack(params) {
        return {
            action: 'attack',
            dir: Direction.D
        };
    }
In the above code snippet, if an enemy is one tile downwards from you then you perform an attack.

**We recommend you skip this part and come back to it once you're clear with all the Special Moves**

**plant bomb**

This will cause the entity to prepare a bomb that will be planted on the next move.

    function attack(params) {
        return {
            action: 'plant bomb'
        };
    }

**Note** : If you return `plant bomb` action, when you've returned a `plant bomb` and haven't moved, the action is 
synonymous to `rest`, because the bomb is already prepared.

**Note** : You don't move when you plant a bomb.

**explosive ring**

This will force the entity to kill all objects (including bombs) in a 2 square radius of the player.

    function attack(params) {
        return {
            action: 'explosive ring'
        };
    }


### Entity

An entity is just a plain old Javascript `Object` that describes well, an *entity*. Its keys describe its state. Available keys are :

* *idx*: A unique `id` that identifies each entity.
* *team*: A number that identifies which team the entity belongs to.
* *pos*: A `Point` object that describes its position on the grid.


### Bomb

A bomb is an object that simulates the existance of the bomb. Every bomb have the following keys

* *pos*: A `Point` object specifying the position of the bomb on the grid.

The `type` key is useful for distinguishing between the Bombs and the Entities.

### Parameters or `params`

Your `attack` and `defend` functions are supplied with a bunch of parameters that specify the current game state. All of these parameters are encapsualted into a single `params` object. All parameters are accesible via the *keys* of this object that are :

***params.self***

An `entity` object that describes the **character that is being updated**.

***params.grid***

Keys,

* `arr` 1D row major representation of *game grid*
* `row` number of rows
* `col` number of columns

A one dimensional `Array` that represents the entire *game grid* at the current instant. The API provides a utility `getAt` function to help seeking using `i`, `j` indexing. 

***params.entities***

An `Object` consisting of all the *entities* currently present on the map including you. It is a key-value pair of the following description

    // object ent is of type Entity
    params.entities = {
        ent.idx: ent
    }

It is hence a key-value holder of all Entities on the map.

> Modifying these parameters *doesn't* change the game state. You can *only* affect the state by *returning* an `action` and update your character.

### Special Moves
Two special moves have been added from the last iteration of Code-Character

#### Bombs
The attacker can place Bombs around the map. The process is as follows:

* He first readies a bomb to be planted in the position he's in.
* On moving from the position he's in, the bomb is primed.

The bombs can kill both the attacker entity and the defender entity, even though only the attacker can plant them. They are triggered when an attacker or a defender steps on them.

The number of bombs the attacker can place are limited. This number is returned by the `getBombsRemaining` function described later. **He has five at the start.**

#### Explosions
The attacker can now initiate a explosion attack around him that will kill every object in range, including bombs. **The range is a default value of 2.**

The number of explosions the attacker can perform is limited. The number of remaining explosions can be accessed through the `getExplosionsRemaining` function described later. **He has two at the start.**


## Functions available
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
Type can be determined via `getType`.

### getEntArray

*Parameters*: `params`

Function that returns the entities on the map as an `Array`

### getType

*Parameters*: `object`

Function that returns the *type* of `object`. The return types for all different objects on the grid are as follows:

* `Entity`: `warrior`
* `Bomb`  : `bomb`
* `Walls` : `tile`
* `Empty` : `free`

### getMove

*Parameters*: `point`, `dir`

Function that returns the point you reach when you move in direction `dir` from `point`.
Note that `point` and `dir` has to be an instance of `Point` and `Direction` objects respectively.

    `
       var new_pos = getMove(point, Direction.U) 
       // returns a `Point` object. `new_pos.i`, `new_pos.j` are the index for new positions.
    `

Note that the APIs' won't change a state of any object. If you want to change the state, then return a result object with `action` key. For example, you can use `getMove` to get the new position and if the new position is suitable for you then just return an `action` with value `move` and `dir` with the direction you passed in `getMove` to actually move to the new position.

### getExplosionsRemaining

*Parameters*: `ent`

Function that returns the number of explosion attacks an entity can do.

    function attack(params) {
        var rem = getExplosionsRemaining(params.self);
        if (rem > 0) // Do explode if you can
            return {
                action: 'explosive ring'
            };
        ...
    }

Note that the parameter `ent` is of type *Entity*.

### getBombsRemaining

*Parameters*: `ent`

Function that returns the number of bombs an entity can plant. Reduces by one every time a bomb is planted.

    function attack(params) {
        var rem = getBombsRemaining(params.self);
        if (rem > 0) // Plant bomb if you have any left
            return {
                action: 'plant bomb'
            };
        ...
    }

Note that the parameter `ent` is of type *Entity*.

### hasPlacedBomb

*Parameters*: `ent`

Attack Private Function that returns whether an attacker entity has prepared earlier to place a bomb through a `plant bomb` action.

    function attack(params) {
        var ent = params.self;
        if (!hasPlacedBomb(ent) && getBombsRemaining(ent) > 0) // Prepare bomb if you already haven't
            return {
                action: `plant bomb`
            }
        ...
    }

**Note** : This function isn't recognized when called in the `defend` function. The linter will block the execution.