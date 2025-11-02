
A reset on the origin tree parser, but with the same concept in mind

1. Convert AST tree to use parts
2. store an ordered structure somewhere.

## Notes

+ This time we do the _basics_ (classes, methods, vars, etc). But potentially custom parsers e.g. `Polypoint.head...`.
+ Too much code last time
+ complex output is bad.

---

Each output unit is info about

+ A folder
+ a file
+ it's classes, objects, vars
+ calls

---


Create descriptors of each unit