
import math




    print("e1*e1         :", str(e1*e1))
    print("pss           :", str(e12))
    print("pss*pss       :", str(e12*e12))


const e1 = new R200(1.0, 1)
const e2 = new R200(1.0, 2)
const e12 = new R200(1.0, 3)


class R200 {
    constructor(value=0, index=0) {
        /*"""Initiate a new R200.

        Optional, the component index can be set with value.
        """*/
        this.mvec = [0] * 4
        this._base = ["1", "e1", "e2", "e12"]
        if (value != 0) {
            this.mvec[index] = value
        }
    }

    @classmethod
    fromarray(cls, array){
        /*"""Initiate a new R200 from an array-like object.

        The first axis of the array is assumed to correspond to the elements
        of the algebra, and needs to have the same length. Any other dimensions
        are left unchanged, and should have simple operations such as addition
        and multiplication defined. NumPy arrays are therefore a perfect
        candidate.

        :param array: array-like object whose length is the dimension of the algebra.
        :return: new instance of R200.
        """*/
        unit = cls();

        if( len(array) != len(unit) ){
            raise TypeError('length of array must be identical to the dimension '
                            'of the algebra.')
        }
        unit.mvec = array
        return unit
    }

    asString() {
        if isinstance(this.mvec, list) {
            res = ' + '.join(filter(None, [("%.7f" % x).rstrip("0").rstrip(".")+(["",this._base[i]][i>0]) if abs(x) > 0.000001 else None for i,x in enumerate(this)]))
        }
        else{
            // # Assume array-like, redirect str conversion
            res = str(this.mvec)
        }
        if (res == '') {
            return "0"
        }
        return res
    }

    getItem(key) {
        // __getitem__(this, key):
        return this.mvec[key]
    }

    setItem(key, value) {
        // __setitem__(this, key, value):
        this.mvec[key] = value
    }

    __len__() {
        // __len__(this):
        return len(this.mvec)
    }

    __invert__(a) {
        /*"""R200.Reverse

        Reverse the order of the basis blades.
        """*/
        res = a.mvec.copy()
        res[0] = a[0]
        res[1] = a[1]
        res[2] = a[2]
        res[3] = -a[3]
        return R200.fromarray(res)
    }

    Dual(a){
        // """R200.Dual

        // Poincare duality operator.
        // """
        res = a.mvec.copy()
        res[0] = -a[3]
        res[1] = -a[2]
        res[2] = a[1]
        res[3] = a[0]
        return R200.fromarray(res)
    }

    Conjugate(a){
        // """R200.Conjugate

        // Clifford Conjugation
        // """
        res = a.mvec.copy()
        res[0] = a[0]
        res[1] = -a[1]
        res[2] = -a[2]
        res[3] = -a[3]
        return R200.fromarray(res)
    }

    Involute(a){
        /*"""R200.Involute

        Main involution
        """*/
        res = a.mvec.copy()
        res[0]=a[0]
        res[1]=-a[1]
        res[2]=-a[2]
        res[3]=a[3]
        return R200.fromarray(res)
    }

    __mul__(a,b){
        /*"""R200.Mul

        The geometric product.
        """*/
        if(type(b) in (int, float)){
            return a.muls(b)
        }
        res = a.mvec.copy()
        res[0] = b[0]*a[0]+b[1]*a[1]+b[2]*a[2]-b[3]*a[3]
        res[1] = b[1]*a[0]+b[0]*a[1]-b[3]*a[2]+b[2]*a[3]
        res[2] = b[2]*a[0]+b[3]*a[1]+b[0]*a[2]-b[1]*a[3]
        res[3] = b[3]*a[0]+b[2]*a[1]-b[1]*a[2]+b[0]*a[3]
        return R200.fromarray(res)
    }

    __rmul__=__mul__

    __xor__(a,b){
        res = a.mvec.copy()
        res[0]=b[0]*a[0]
        res[1]=b[1]*a[0]+b[0]*a[1]
        res[2]=b[2]*a[0]+b[0]*a[2]
        res[3]=b[3]*a[0]+b[2]*a[1]-b[1]*a[2]+b[0]*a[3]
        return R200.fromarray(res)
    }

    __and__(a,b){
        res = a.mvec.copy()
        res[3]=1*(a[3]*b[3])
        res[2]=-1*(a[2]*-1*b[3]+a[3]*b[2]*-1)
        res[1]=1*(a[1]*b[3]+a[3]*b[1])
        res[0]=1*(a[0]*b[3]+a[1]*b[2]*-1-a[2]*-1*b[1]+a[3]*b[0])
        return R200.fromarray(res)
    }

    __or__(a,b){
        res = a.mvec.copy()
        res[0]=b[0]*a[0]+b[1]*a[1]+b[2]*a[2]-b[3]*a[3]
        res[1]=b[1]*a[0]+b[0]*a[1]-b[3]*a[2]+b[2]*a[3]
        res[2]=b[2]*a[0]+b[3]*a[1]+b[0]*a[2]-b[1]*a[3]
        res[3]=b[3]*a[0]+b[0]*a[3]
        return R200.fromarray(res)
    }

    __add__(a,b) {
        /*"""R200.Add

        Multivector addition
        """*/
        if(type(b) in (int, float)){
            return a.adds(b)
        }
        res = a.mvec.copy()
        res[0] = a[0]+b[0]
        res[1] = a[1]+b[1]
        res[2] = a[2]+b[2]
        res[3] = a[3]+b[3]
        return R200.fromarray(res)
    }

    __radd__=__add__

    __sub__(a,b) {
        /*"""R200.Sub

        Multivector subtraction
        """*/
        if(type(b) in (int, float) ){
            return a.subs(b)
        }
        res = a.mvec.copy()
        res[0] = a[0]-b[0]
        res[1] = a[1]-b[1]
        res[2] = a[2]-b[2]
        res[3] = a[3]-b[3]
        return R200.fromarray(res)
    }

    __rsub__(a,b){
        /*"""R200.Sub

        Multivector subtraction
        """*/
        return b + -1 * a
    }

    smul(a,b){
        res = a.mvec.copy()
        res[0] = a*b[0]
        res[1] = a*b[1]
        res[2] = a*b[2]
        res[3] = a*b[3]
        return R200.fromarray(res)
    }

    muls(a,b){
        res = a.mvec.copy()
        res[0] = a[0]*b
        res[1] = a[1]*b
        res[2] = a[2]*b
        res[3] = a[3]*b
        return R200.fromarray(res)
    }

    sadd(a,b){
        res = a.mvec.copy()
        res[0] = a+b[0]
        res[1] = b[1]
        res[2] = b[2]
        res[3] = b[3]
        return R200.fromarray(res)
    }

    adds(a,b){
        res = a.mvec.copy()
        res[0] = a[0]+b
        res[1] = a[1]
        res[2] = a[2]
        res[3] = a[3]
        return R200.fromarray(res)
    }


    ssub(a,b){
        res = a.mvec.copy()
        res[0] = a-b[0]
        res[1] = -b[1]
        res[2] = -b[2]
        res[3] = -b[3]
        return R200.fromarray(res)
    }


    subs(a,b){
        res = a.mvec.copy()
        res[0] = a[0]-b
        res[1] = a[1]
        res[2] = a[2]
        res[3] = a[3]
        return R200.fromarray(res)
    }


    norm(a){
        return abs( (a * a.Conjugate())[0] ) ** 0.5
    }

    inorm(a){
        return a.Dual().norm()
    }

    normalized(a){
        return a * (1 / a.norm())
    }

}


