units = [
    [ 0,20 ],
    [ 2,22 ],
    [ 4,24 ],
    [ 5,6 ],
    [ 6,26 ],
    [ 7,27 ],
]

from decimal import Decimal
# >>> Decimal('4.20') % 1
# Decimal('0.20')

def main():
    run_items(units)
    for a in range(0, 100000):
        for b in range(0, 100000):
            run_items([(a, b)])
    print("All tests passed!")


def run_items(items):
    """
    compress then expand two integers into a single value, then split it back out.

        in = 7, 27 
    
    add both, find the divisor and apply as the float 

        store = 34.205882352941174
    
    then break it 

        >>> 34 * .205882352941174
        6.999999999999916
        >>> round(34 * .205882352941174)
        7
        >>> 34 - round(34 * .205882352941174)
        27
    """
    quant = 8

    for a, b in items:
        total = a+b 
        split = a / (total + 1) if total > 0 else 0
        res = str(total + split)
        # print(f"{a}, {b} | {split} == {res}")
        # now break it back out
        dec = Decimal(str(res))
        dec_rem = dec % 1
        dec_int = int(dec)
        # print(f"  dec: {dec} | int: {dec_int} | rem: {dec_rem}")
        assert dec_int == total, f"Expected {total} but got {dec_int}"
     
        rem_a = float(round(dec_rem, quant))
        rem_b = float(round(split, quant))

        ## Importantly if more strict here, this can fail. But the values 
        ## may not need to be exact, just close enough. So we round to a certain number
        ## With quant=8 this passes, lesser than that, this fails, but the algo completes.
        # assert rem_a == rem_b, f"Expected {type(rem_b)} {rem_b} but got {type(rem_a)} {rem_a}"

        # print(f"  rem_a: {rem_a} | rem_b: {rem_b}")
        a_back = round((dec_int + 1) * rem_a)
        b_back = dec_int - a_back
        # print(f"  a_back: {a_back} | b_back: {b_back}")
        assert a_back == a, f"A: Expected {a} but got {a_back}"
        assert b_back == b, f"B: Expected {b} but got {b_back}"
    # print("  Success!")


if __name__ == "__main__":
    main()