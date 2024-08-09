# /*"""3D Projective Geometric Algebra.

# Written by a generator written by enki.
# """*/


e0 = PGA2D(1.0, 1)
e1 = PGA2D(1.0, 2)
e2 = PGA2D(1.0, 3)
e01 = PGA2D(1.0, 4)
e20 = PGA2D(1.0, 5)
e12 = PGA2D(1.0, 6)
e012 = PGA2D(1.0, 7)


print("e0*e0         :", str(e0*e0))
print("pss           :", str(e012))
print("pss*pss       :", str(e012*e012))


__author__ = 'Enki'

import math

class PGA2D {

    __init__(value=0, index=0){
        /*"""Initiate a new PGA2D.

        Optional, the component index can be set with value.
        """*/
        this.mvec = [0] * 8
        this._base = ["1", "e0", "e1", "e2", "e01", "e20", "e12", "e012"]
        if (value != 0):
            this.mvec[index] = value
    }

    @classmethod
    fromarray(cls, array){
        /*"""Initiate a new PGA2D from an array-like object.

        The first axis of the array is assumed to correspond to the elements
        of the algebra, and needs to have the same length. Any other dimensions
        are left unchanged, and should have simple operations such as addition
        and multiplication defined. NumPy arrays are therefore a perfect
        candidate.

        :param array: array-like object whose length is the dimension of the algebra.
        :return: new instance of PGA2D.
        """*/
        this = cls()
        if len(array) != len(this) {
            raise TypeError('length of array must be identical to the dimension '
                            'of the algebra.')
        }
        this.mvec = array
        return this
    }

    __str__(){
        if isinstance(this.mvec, list){
            res = ' + '.join(filter(None, [("%.7f" % x).rstrip("0").rstrip(".")+(["",this._base[i]][i>0]) if abs(x) > 0.000001 else None for i,x in enumerate(this)]))
        }
        else { //  # Assume array-like, redirect str conversion
            res = str(this.mvec)
        }

        if (res == ''){
            return "0"
        }
        return res
    }

    __getitem__(key){
        return this.mvec[key]
    }

    __setitem__(key, value){
        this.mvec[key] = value
    }

    __len__(){
        return len(this.mvec)
    }

    __invert__(a){
        /*"""PGA2D.Reverse

        Reverse the order of the basis blades.
        """*/
        res = a.mvec.copy()
        res[0]=a[0]
        res[1]=a[1]
        res[2]=a[2]
        res[3]=a[3]
        res[4]=-a[4]
        res[5]=-a[5]
        res[6]=-a[6]
        res[7]=-a[7]
        return PGA2D.fromarray(res)
    }

    Dual(a){
        /*"""PGA2D.Dual

        Poincare duality operator.
        """*/
        res = a.mvec.copy()
        res[0]=a[7]
        res[1]=a[6]
        res[2]=a[5]
        res[3]=a[4]
        res[4]=a[3]
        res[5]=a[2]
        res[6]=a[1]
        res[7]=a[0]
        return PGA2D.fromarray(res)
    }

    Conjugate(a){
        /*"""PGA2D.Conjugate

        Clifford Conjugation
        """*/
        res = a.mvec.copy()
        res[0]=a[0]
        res[1]=-a[1]
        res[2]=-a[2]
        res[3]=-a[3]
        res[4]=-a[4]
        res[5]=-a[5]
        res[6]=-a[6]
        res[7]=a[7]
        return PGA2D.fromarray(res)
    }

    Involute(a){
        /*"""PGA2D.Involute

        Main involution
        """*/
        res = a.mvec.copy()
        res[0]=a[0]
        res[1]=-a[1]
        res[2]=-a[2]
        res[3]=-a[3]
        res[4]=a[4]
        res[5]=a[5]
        res[6]=a[6]
        res[7]=-a[7]
        return PGA2D.fromarray(res)
    }

    __mul__(a,b){
        /*"""PGA2D.Mul

        The geometric product.
        """*/
        if type(b) in (int, float){
            return a.muls(b)
        }
        res = a.mvec.copy()
        res[0]=b[0]*a[0]+b[2]*a[2]+b[3]*a[3]-b[6]*a[6]
        res[1]=b[1]*a[0]+b[0]*a[1]-b[4]*a[2]+b[5]*a[3]+b[2]*a[4]-b[3]*a[5]-b[7]*a[6]-b[6]*a[7]
        res[2]=b[2]*a[0]+b[0]*a[2]-b[6]*a[3]+b[3]*a[6]
        res[3]=b[3]*a[0]+b[6]*a[2]+b[0]*a[3]-b[2]*a[6]
        res[4]=b[4]*a[0]+b[2]*a[1]-b[1]*a[2]+b[7]*a[3]+b[0]*a[4]+b[6]*a[5]-b[5]*a[6]+b[3]*a[7]
        res[5]=b[5]*a[0]-b[3]*a[1]+b[7]*a[2]+b[1]*a[3]-b[6]*a[4]+b[0]*a[5]+b[4]*a[6]+b[2]*a[7]
        res[6]=b[6]*a[0]+b[3]*a[2]-b[2]*a[3]+b[0]*a[6]
        res[7]=b[7]*a[0]+b[6]*a[1]+b[5]*a[2]+b[4]*a[3]+b[3]*a[4]+b[2]*a[5]+b[1]*a[6]+b[0]*a[7]
        return PGA2D.fromarray(res)
    }

    __rmul__=__mul__

    __xor__(a,b){
        res = a.mvec.copy()
        res[0] = b[0]*a[0]
        res[1] = b[1]*a[0]+b[0]*a[1]
        res[2] = b[2]*a[0]+b[0]*a[2]
        res[3] = b[3]*a[0]+b[0]*a[3]
        res[4] = b[4]*a[0]+b[2]*a[1]-b[1]*a[2]+b[0]*a[4]
        res[5] = b[5]*a[0]-b[3]*a[1]+b[1]*a[3]+b[0]*a[5]
        res[6] = b[6]*a[0]+b[3]*a[2]-b[2]*a[3]+b[0]*a[6]
        res[7] = b[7]*a[0]+b[6]*a[1]+b[5]*a[2]+b[4]*a[3]+b[3]*a[4]+b[2]*a[5]+b[1]*a[6]+b[0]*a[7]
        return PGA2D.fromarray(res)
    }

    __and__(a,b){
        res = a.mvec.copy()
        res[7]=1*(a[7]*b[7])
        res[6]=1*(a[6]*b[7]+a[7]*b[6])
        res[5]=1*(a[5]*b[7]+a[7]*b[5])
        res[4]=1*(a[4]*b[7]+a[7]*b[4])
        res[3]=1*(a[3]*b[7]+a[5]*b[6]-a[6]*b[5]+a[7]*b[3])
        res[2]=1*(a[2]*b[7]-a[4]*b[6]+a[6]*b[4]+a[7]*b[2])
        res[1]=1*(a[1]*b[7]+a[4]*b[5]-a[5]*b[4]+a[7]*b[1])
        res[0]=1*(a[0]*b[7]+a[1]*b[6]+a[2]*b[5]+a[3]*b[4]+a[4]*b[3]+a[5]*b[2]+a[6]*b[1]+a[7]*b[0])
        return PGA2D.fromarray(res)
    }

    __or__(a,b){
        res = a.mvec.copy()
        res[0]=b[0]*a[0]+b[2]*a[2]+b[3]*a[3]-b[6]*a[6]
        res[1]=b[1]*a[0]+b[0]*a[1]-b[4]*a[2]+b[5]*a[3]+b[2]*a[4]-b[3]*a[5]-b[7]*a[6]-b[6]*a[7]
        res[2]=b[2]*a[0]+b[0]*a[2]-b[6]*a[3]+b[3]*a[6]
        res[3]=b[3]*a[0]+b[6]*a[2]+b[0]*a[3]-b[2]*a[6]
        res[4]=b[4]*a[0]+b[7]*a[3]+b[0]*a[4]+b[3]*a[7]
        res[5]=b[5]*a[0]+b[7]*a[2]+b[0]*a[5]+b[2]*a[7]
        res[6]=b[6]*a[0]+b[0]*a[6]
        res[7]=b[7]*a[0]+b[0]*a[7]
        return PGA2D.fromarray(res)
    }

    __add__(a,b){
        /*"""PGA2D.Add

        Multivector addition
        """*/
        if type(b) in (int, float){
            return a.adds(b)
        }
        res = a.mvec.copy()
        res[0] = a[0]+b[0]
        res[1] = a[1]+b[1]
        res[2] = a[2]+b[2]
        res[3] = a[3]+b[3]
        res[4] = a[4]+b[4]
        res[5] = a[5]+b[5]
        res[6] = a[6]+b[6]
        res[7] = a[7]+b[7]
        return PGA2D.fromarray(res)
    }
    __radd__=__add__

    __sub__(a,b){
        /*"""PGA2D.Sub

        Multivector subtraction
        """*/
        if type(b) in (int, float){
            return a.subs(b)
        }
        res = a.mvec.copy()
        res[0] = a[0]-b[0]
        res[1] = a[1]-b[1]
        res[2] = a[2]-b[2]
        res[3] = a[3]-b[3]
        res[4] = a[4]-b[4]
        res[5] = a[5]-b[5]
        res[6] = a[6]-b[6]
        res[7] = a[7]-b[7]
        return PGA2D.fromarray(res)
    }

    __rsub__(a,b){
        /*"""PGA2D.Sub

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
        res[4] = a*b[4]
        res[5] = a*b[5]
        res[6] = a*b[6]
        res[7] = a*b[7]
        return PGA2D.fromarray(res)
    }

    muls(a,b){
        res = a.mvec.copy()
        res[0] = a[0]*b
        res[1] = a[1]*b
        res[2] = a[2]*b
        res[3] = a[3]*b
        res[4] = a[4]*b
        res[5] = a[5]*b
        res[6] = a[6]*b
        res[7] = a[7]*b
        return PGA2D.fromarray(res)
    }

    sadd(a,b){
        res = a.mvec.copy()
        res[0] = a+b[0]
        res[1] = b[1]
        res[2] = b[2]
        res[3] = b[3]
        res[4] = b[4]
        res[5] = b[5]
        res[6] = b[6]
        res[7] = b[7]
        return PGA2D.fromarray(res)
    }

    adds(a,b){
        res = a.mvec.copy()
        res[0] = a[0]+b
        res[1] = a[1]
        res[2] = a[2]
        res[3] = a[3]
        res[4] = a[4]
        res[5] = a[5]
        res[6] = a[6]
        res[7] = a[7]
        return PGA2D.fromarray(res)
    }

    ssub(a,b){
        res = a.mvec.copy()
        res[0] = a-b[0]
        res[1] = -b[1]
        res[2] = -b[2]
        res[3] = -b[3]
        res[4] = -b[4]
        res[5] = -b[5]
        res[6] = -b[6]
        res[7] = -b[7]
        return PGA2D.fromarray(res)
    }

    subs(a,b){
        res = a.mvec.copy()
        res[0] = a[0]-b
        res[1] = a[1]
        res[2] = a[2]
        res[3] = a[3]
        res[4] = a[4]
        res[5] = a[5]
        res[6] = a[6]
        res[7] = a[7]
        return PGA2D.fromarray(res)
    }

    norm(a){
        return abs((a * a.Conjugate())[0])**0.5
    }

    inorm(a){
        return a.Dual().norm()
    }

    normalized(a){
        return a * (1 / a.norm())
    }


}