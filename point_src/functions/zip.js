
/*
title: Zip
---

The _zip_ function combines multiple arrays by pairing elements at the same index
position. It returns an iterator that yields tuples of corresponding elements.

The `zip()` function is a generator for memory-efficient iteration:

    // Zip two split lines together
    for(let pair of zip(line1.splits, line2.splits)) {
        (new PointList(...pair)).pen.line(ctx)
    }

    // Zip three arrays
    for(let [a, b, c] of zip(arr1, arr2, arr3)) {
        console.log(a, b, c)
    }

    // Convert to array
    const pairs = [...zip(splits1, splits2)]

For eager evaluation, use `zipArray()` which returns an array immediately:

    const pairs = zipArray(splits1, splits2)
    pairs.forEach((pair) => {
        (new PointList(...pair)).pen.line(ctx)
    })

*/

function* zip(...arrays) {
    /* Usage:

        // Returns an iterator that yields arrays of corresponding elements
        for(let pair of zip(this.splits1, this.splits2)) {
            (new PointList(...pair)).pen.line(ctx)  // Spread the pair
        }

        // Or collect all at once:
        const pairs = Array.from(zip(arr1, arr2, arr3))
        
        // Or use spread:
        const pairs = [...zip(arr1, arr2)]
    */
    
    if (arrays.length === 0) return;
    
    // Find the maximum length across all arrays
    let maxLength = 0;
    for (let i = 0; i < arrays.length; i++) {
        const len = arrays[i].length;
        if (len > maxLength) maxLength = len;
    }
    
    // Yield tuples for each index position
    for (let i = 0; i < maxLength; i++) {
        const tuple = new Array(arrays.length);
        for (let j = 0; j < arrays.length; j++) {
            tuple[j] = arrays[j][i];
        }
        yield tuple;
    }
}

// Non-generator version for when you need immediate array results
function zipArray(...arrays) {
    /* Eager evaluation version - returns an array immediately
    
    Usage:

        const pairs = zipArray(this.splits1, this.splits2)
        pairs.forEach((pair) => {
            (new PointList(...pair)).pen.line(ctx)  // Spread the pair
        })
    */
    
    if (arrays.length === 0) return [];
    
    // Find the maximum length
    let maxLength = 0;
    for (let i = 0; i < arrays.length; i++) {
        const len = arrays[i].length;
        if (len > maxLength) maxLength = len;
    }
    
    // Pre-allocate result array for performance
    const result = new Array(maxLength);
    
    for (let i = 0; i < maxLength; i++) {
        const tuple = new Array(arrays.length);
        for (let j = 0; j < arrays.length; j++) {
            tuple[j] = arrays[j][i];
        }
        result[i] = tuple;
    }
    
    return result;
}