# API

## Point

A constructor that simplifies creation of `i`, `j` objects
    
    var p = new Point(0, 0);
    console.log(p);

    /* OUTPUT */
    {
        i: 0,
        j: 0
    }

## Direction

An object containing constants representing the directions,

    const Direction = {
        U: 0,
        D: 1,
        L: 2,
        R: 3
    }


## isValid

*Parameters*: `params`, `point`

Function that returns whether a certain point is within the bounds of the map.

## getAt

*Parameters*: `params`, `point`

Function that returns an `Object` at the given `point` on the map.
The object may be either an *entity* or a *tile* or value `0` if it's free.
Type can be determined via [getType](#gettype)

## getDistance

*Parameters*: `pointA`, `pointB`

Function that returns the [Manhattan distance](http://en.wikipedia.org/wiki/Taxicab_geometry) between two points

## getDirection

*Parameters*: `pointA`, `pointB`

Function that gets the *direction* of the maximum difference between `pointB` and `pointA`. Returns `-1` if both are same;

## getEntArray

*Parameters*: `params`

Function that returns the entities on the map as an `Array`

## getType

*Parameters*: `object`

Function that returns the *type* of object from the return value of [getAt](#getat) or `none` if it's empty.

## getMove

*Parameters*: `point`, `dir`

Function that returns the point you reach when you move in direction `dir` from `point`.
