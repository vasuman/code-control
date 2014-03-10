# Update

The single entry point to all your code. This is the only function that is actually called by the simulation. Controls the `action` your character takes during that turn. Any **declared** global variables are accessible *persistantly*. The `update` function **must** be declared.

> Additional functions -- that are called from `update` may also be declared.

## Return Value

The `action` your character performs is determined by the `Object` that your function returns.
The **compulsory** key that your return object must posses is the `action` key. This key can be any one of,

### rest

Does *nothing* for that turn.

    function update(params) {
        return { action: 'rest' }    
    }

> Any additional keys are ignored

### move

Attempts to move in the particular [Direction](api.html#direction). If the new position is invalid -- out of bounds; or already occupied, the `move` *fails*.
This action **requires** an additional `dir` key which specifies the [Direction](api.html#direction) to move in.

    function update(params) {
        return {
            action: 'move',
            dir: Direction.U
        }
    }

### attack

If an entity is present *one* tile away in the [Direction](api.html#direction) `dir` from the current position. The other character is `damaged`.

    function update(params) {
        return {
            action: 'attack',
            dir: Direction.D
        }
    }


## Entity

An entity is just a plain old Javascript `Object` that describes well, an *entity*. Its keys describe its state. Available keys,

* *idx*: A unique `id` that identifies each entity.
* *team*: A number that identifies which team the entity belongs to.
* *pos*: A [Point](api.html#point) object that describes its position on the grid.
* *health*: The remaining health of the entity.

## Parameters

Your `update` function is supplied with a bunch of parameters that specify the current game state. All of these parameters are encapsualted into a single `params` object. All parameters are accesible via the *keys* of this object.

### params.self

An `entity` object that describes the **character that is being updated**.

### params.grid

Keys,
* `arr` 1D row major representation of *game grid*
* `row` number of rows
* `col` number of columns
A one dimensional `Array` that represents the entire *game grid* at the current instant. The API provides a utility [getAt](api.html#getat) function to help seeking using traditional `i`, `j` indexing.

> Modifying these parameters *doesn't* change the game state. You can *only* affect the state by *returning* an `action` and update your character.

### params.entities

An `Object` consisting of all the *entities* currently present on the map .
