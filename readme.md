# What

A view space should be 'pannable' - with infinite edges and partial render spaces.
Each 'segment' is subdivided into grids.

The user maintains a position space to activate 'spaces'


1. infinite zoom out
    because why should limits occur when sector stepping
2. Infinite panning
    a sectormay bind to another sector
3. n dimension
    initially a sector is a 2D space; but the _cube_ is also viable.
4. Viewports
    A viewspace into the plane
