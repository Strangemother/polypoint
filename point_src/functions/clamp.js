

const clamp = function(v, lower=undefined, upper=undefined) {
    let res = v;
    if(lower !== undefined && v < lower) {
        res = lower;
    }

    if(upper !== undefined && v > upper) {
        res = upper;
    }
    return res
}
