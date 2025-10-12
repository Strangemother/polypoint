from pathlib import Path
import requests
import example 

pub, priv = example.save_keypair('test_key', '.')

def main():
    res = receive_public_key(pub.read_bytes())
    print("verify:", res)


# Client _A_ sends public key
def post_public_key(endpoint_url, public_key, **kwargs):
    response = requests.post(endpoint_url,
        data={ 'public_key': public_key, **kwargs}
    )
    return response


def receive_form(request):
    public_key = request.form.get('public_key')
    if not public_key:
        return False
    # Simulate receiving the public key via POST
    return receive_public_key(public_key)

# Client B recieves the post and if valid, contnued the request.
def receive_public_key(public_key):
    # public_key = request.form.get('public_key')
    
    pub_bytes = public_key#.encode('utf-8')
    priv_bytes = get_private_key_bytes() # Load from secure storage
    if example.verify_key_pair(pub_bytes, priv_bytes):
        return True
    
    return False 


def get_private_key_bytes():
    return Path('test_key').read_bytes()


if __name__ == "__main__":
    main()