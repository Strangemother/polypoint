/*
    Assist with the discovery of siblings in a grid.

        // Example usage:
        rowCount = 9;
        positionIndex = 5;
        console.log(getNeighboursRect(positionIndex, rowCount));
*/
function getNeighboursRect(index, rowCount, columnCount, rowWidth) {
    let total = rowCount * columnCount

    const currentRow = Math.floor(index / columnCount)
        , currentColumn = index % columnCount
        , size  = total
        /* Up must step back as many cells as a column*/
        , up    = index - columnCount
        , left  = index - 1
        , right = index + 1
        , down  = index + columnCount
        , res = []
        ;

    // console.log(index, 'up', up, 'left', left, 'right', right, 'down', down)

    const inBounds = (v) => (v >= 0) && (v < total);
    const boundPush = (v) => inBounds(v) && res.push(v);

    boundPush(up);
    boundPush(down);

    // left should be the same column
    let leftCol = left % total;
    let leftRow = Math.floor(left / columnCount);

    (currentRow == leftRow) && boundPush(left);
    // if most right (col ==  total), right cannot be applied.
    (currentColumn != columnCount-1) && boundPush(right);

    return res.sort()

}


function getNeighbours(index, rowWidth) {

    const row = Math.floor(index / rowWidth)
        , col = index % rowWidth
        , size  = rowWidth * rowWidth
        , up    = index - rowWidth
        , left  = index - 1
        , right = index + 1
        , down  = index + rowWidth
        , res = []
        ;

    // console.log(index, 'up', up, 'left', left, 'right', right, 'down', down)

    const inBounds = (v) => (v >= 0) && (v < size);
    const boundPush = (v) => inBounds(v) && res.push(v);

    boundPush(up);
    boundPush(down);
    // if most left (col 0), left cannot be applied.
    (col > 0) && boundPush(left);
    // if most right (col ==  rowWidth), right cannot be applied.
    (col != rowWidth-1) && boundPush(right);

    return res.sort()

}


const arrayMatch = (a,b) => {
    let sb = b.sort()
    return (a.length == b.length ) && a.sort().every((e,i)=>sb[i]==e)
}


const runTests = function(){

    runOne(0, [1, 3],       'first item')
    runOne(1, [0, 2, 4],    'first row center item')
    runOne(2, [1, 5],       'first row last item')
    runOne(3, [0, 4, 6],    'second row first item')
    runOne(4, [1, 3, 5, 7], 'center')
    runOne(5, [2, 4, 8],    'second row last item')
    runOne(6, [3, 7],       'last row first item')
    runOne(7, [4, 6, 8],    'last row center item')
    runOne(8, [5, 7],       'last item')
}


const runOne = function(index, expected, extra='') {
    res = getNeighbours(index, 3)
    exp = expected
    extra = extra.length == 0? extra: `${extra}, `
    let isMatch = arrayMatch(res, exp)
    let f = isMatch? 'log': 'warn'
    if(!isMatch) {
    console[f](`match=${isMatch} (${index}) result=${res} != expected=${exp},  ${extra}`)
    }
}


const runRectTests = function(){
    let shape = { rows: 3, cols: 7}
    /* First row */
    runRectOne(shape, 0, [1, 7],       'first item')
    runRectOne(shape, 1, [0, 2, 8],    )
    runRectOne(shape, 2, [1, 3, 9],    )
    runRectOne(shape, 3, [2, 4, 10],   )
    runRectOne(shape, 6, [5, 13],      )

    runRectOne(shape, 7, [0, 8, 14],   )
    runRectOne(shape, 8, [1, 7, 9, 15],   )
    runRectOne(shape, 9, [2, 8, 10, 16],   )
    runRectOne(shape, 10, [3, 9, 11, 17],   )
    runRectOne(shape, 11, [4, 10, 12, 18],   )
    runRectOne(shape, 12, [5, 11, 13, 19],   )
    runRectOne(shape, 13, [6,12, 20],   )

    runRectOne(shape, 14, [7, 15],   )
    runRectOne(shape, 20, [13, 19],   )

}

const runRectOne = function(shape, index, expected, extra='') {
    res = getNeighboursRect(index, shape.rows, shape.cols)
    exp = expected
    extra = extra.length == 0? extra: `${extra}, `
    let isMatch = arrayMatch(res, exp)
    let f = isMatch? 'log': 'warn'
    if(!isMatch) {
        console[f](`match=${isMatch} (${index}) result=${res} != expected=${exp},  ${extra}`)
    }
}

