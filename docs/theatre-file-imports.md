# Theatre Files

A theatre file is a javascript file to run your main implementation (such as a stage.)
At the top of the file we can define metadata as a comment:

```js
/*
title: Fancy Browser Title
files:
    ../point_src/core/head.js
    ../point_src/stage.js
---

# My Content!

This is a description about this file.
*/

class MainStage extends Stage {
    canvas='playspace'
}
```

We can define `files` to import as standard JS.

## File Entries


### Relative Filepath

The file reference import is relative from the current file location.

```js
/*
files:
    ../point_src/core/head.js
    ../point_src/stage.js
    // ...
*/
```

### Absolute Path

A filepath can be any reference, such as an absolute address

```js
/*
files:
    https://jsdeliver/example
    ../point_src/core/head.js
    mouse
    pointList
*/
```


### Filepack Reference

The `files.json` presents all files and their dependencies. The name of a reference
can be imported, with all the dependencies correctly applied:


```js
/*
files:
    head
    mouse
    pointList
*/
```

When leading a filepach reference, we can apply the `src_dir` as a relative location
for the imports


```js
/*
src_dir: ../point_src/
files:
    head
    mouse
    pointList
*/
```

Result:

```js
/*
files:
    ../point_src/core/head.js
    ../point_src/automouse.js
    ../point_src/pointlist.js
    // ...
*/
```

The references can be mixed with standard paths. Ordering is managed.

#### Key Points

+ the files can be mixed and matched
+ dependences are applied in order
+ repeats are ignored

```js
/*
src_dir: ../point_src/
files:
    ../point_src/distances.js
    pointlist
    ../point_src/events.js
    ../point_src/functions/clamp.js
    dragging
    stroke
    ../point_src/automouse.js
 */
```