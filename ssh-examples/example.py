"""
pip install cryptography
"""
# import requests
from pathlib import Path
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.backends import default_backend
# from cryptography.exceptions import UnsupportedAlgorithm



def main(): 
    public_key_bytes, private_key_bytes = generate_test_keypair()
    res = verify_key_pair(public_key_bytes, private_key_bytes)
    print("verify:", res)


def verify_key_pair(public_key_bytes, private_key_bytes):
    # From the local private key, derive the public key
    derived_public_bytes = derive_public(private_key_bytes)
    # Load and _decode_ the _given_ public 
    provided_public_bytes = normalize_public(public_key_bytes)
    return derived_public_bytes == provided_public_bytes


def normalize_public(public_key_bytes):
    """Load the provided public key and return its bytes in OpenSSH format.
    """
    # Load the provided public key
    provided_public_key = serialization.load_ssh_public_key(
        public_key_bytes,
        backend=default_backend()
    )

    provided_public_bytes = provided_public_key.public_bytes(
        encoding=serialization.Encoding.OpenSSH,
        format=serialization.PublicFormat.OpenSSH
    )
    
    return provided_public_bytes


def derive_public(private_key_bytes):
    # Load the private key    
    private_key = serialization.load_ssh_private_key(private_key_bytes,
                        password=None,
                        backend=default_backend()
                    )
    
    # Get public key from private key
    derived_public_key = private_key.public_key()
    derived_public_bytes = derived_public_key.public_bytes(
        encoding=serialization.Encoding.OpenSSH,
        format=serialization.PublicFormat.OpenSSH
    )
    return derived_public_bytes



def generate_test_keypair():
    """
    Generates a test RSA key pair.
    
    Returns:
        Tuple of (private_key_str, public_key_bytes) in OpenSSH format
    """
    # Generate RSA key pair
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
        backend=default_backend()
    )
    
    # Serialize private key
    private_key_bytes = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.OpenSSH,
        encryption_algorithm=serialization.NoEncryption()
    )
    
    # Serialize public key
    public_key = private_key.public_key()
    public_key_bytes = public_key.public_bytes(
        encoding=serialization.Encoding.OpenSSH,
        format=serialization.PublicFormat.OpenSSH
    )
    
    return (
        public_key_bytes,#.decode('utf-8'),
        private_key_bytes#.decode('utf-8'),
    )


def save_keypair(pair_name='test_key', dir_path='.'):
    private_key_path = Path(dir_path) / pair_name
    public_key_path = Path(dir_path) / f"{pair_name}.pub"
    public_key_bytes, private_key_bytes = generate_test_keypair()
    Path(private_key_path).write_bytes(private_key_bytes)
    Path(public_key_path).write_bytes(public_key_bytes)
    return public_key_path, private_key_path



if __name__ == "__main__":
    main()