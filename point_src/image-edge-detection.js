
var detectEdges = function(data, width) {

    const round = Math.round;
    const min = Math.min;
    const max = Math.max;
    let dl = data.length
    let lineCount = (dl * .25) / width
    let rowAlpha = 0
    let lastCurrentRow = -1
    let doneSide = false;
    let tolerance = 2
    let leftValue = width // -1
    let rightValue = -1
    let topValue = 0
    let bottomValue = 0

    let doneRowLeft = false
    let doneRowTop = false

    for (var i = 0; i < dl; i += 4) {
        let currentRow = Math.floor(i / (width * 4));
        let currentColumn = (i * .25) % width;
        let alpha = data[i+3];

        if(currentRow > lastCurrentRow) {
            // moved to new row
            doneRowLeft = false

            /* top -> down */
            if(doneRowTop == false) {
                if(rowAlpha > tolerance) {
                    doneRowTop = true
                } else {
                    topValue += 1
                }
            }

            /* bottom -> up */
            if(rowAlpha > tolerance) {
                bottomValue = currentRow
            }

            rowAlpha = 0
        }

        rowAlpha += alpha

        /* right to left. */
        if(alpha > tolerance) {
            rightValue = max(rightValue, currentColumn)
        }

        /* left to right */
        if(doneRowLeft == false && rowAlpha > tolerance) {

            if(currentColumn < leftValue) {
                leftValue = currentColumn;
            }

            doneRowLeft = true
        }

        lastCurrentRow = currentRow
    }

    let d = {
        'top': topValue
        , 'left': leftValue
        , 'right': rightValue
        , 'bottom': bottomValue
        , 'width': rightValue - leftValue
        , 'height': bottomValue - topValue
    }

    return d
}

