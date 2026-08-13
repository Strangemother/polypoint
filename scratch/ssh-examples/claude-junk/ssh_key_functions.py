"""
SSH Key Functions: Send and Verify
"""
import requests
from pathlib import Path
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.backends import default_backend
from cryptography.exceptions import UnsupportedAlgorithm


def main():
    # Generate test keypair
    print("Generating test keypair...")
    private_key, public_key = generate_test_keypair()
    
    print(f"\nPrivate Key:\n{private_key}")
    print(f"\nPublic Key:\n{public_key}")
    
    # Save to temporary files for testing
    test_private = Path("/tmp/test_key")
    test_public = Path("/tmp/test_key.pub")
    
    test_private.write_text(private_key)
    test_public.write_text(public_key)
    
    print(f"\nKeys saved to {test_private} and {test_public}")
    
    # Test verification
    print("\nTesting key pair verification...")
    is_valid = verify_key_pair(public_key, str(test_private))
    print(f"Key pair valid: {is_valid}")
    
    # Test sending (will fail if no server running, but demonstrates usage)
    print("\nExample: sending public key to endpoint...")
    print(f"send_public_key('http://localhost:5000/verify', public_key)")


def send_public_key(endpoint_url, public_key_str):
    """
    Sends an SSH public key to an endpoint via form POST.
    
    Args:
        endpoint_url: The URL to POST to
        public_key_str: SSH public key as string
        
    Returns:
        Response object from requests
    """
    # Send as form data
    response = requests.post(
        endpoint_url,
        data={'public_key': public_key_str}
    )
    
    return response


def verify_key_pair(public_key_str, private_key_path):
    """
    Verifies that a public key matches a private key.
    
    Args:
        public_key_str: SSH public key as string
        private_key_path: Path to the private key file
        
    Returns:
        Boolean - True if keys match, False otherwise
        
    Raises:
        FileNotFoundError: If private key file doesn't exist
        ValueError: If key format is invalid
        UnsupportedAlgorithm: If key algorithm is not supported
    """
    # Load the private key
    private_key_bytes = Path(private_key_path).expanduser().read_bytes()
    private_key = serialization.load_ssh_private_key(
        private_key_bytes,
        password=None,
        backend=default_backend()
    )
    
    # Get public key from private key
    derived_public_key = private_key.public_key()
    derived_public_bytes = derived_public_key.public_bytes(
        encoding=serialization.Encoding.OpenSSH,
        format=serialization.PublicFormat.OpenSSH
    )
    
    # Load the provided public key
    provided_public_key = serialization.load_ssh_public_key(
        public_key_str.encode('utf-8'),
        backend=default_backend()
    )
    provided_public_bytes = provided_public_key.public_bytes(
        encoding=serialization.Encoding.OpenSSH,
        format=serialization.PublicFormat.OpenSSH
    )
    
    # Compare the keys
    return derived_public_bytes == provided_public_bytes


def generate_test_keypair():
    """
    Generates a test RSA key pair.
    
    Returns:
        Tuple of (private_key_str, public_key_str) in OpenSSH format
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
        private_key_bytes.decode('utf-8'),
        public_key_bytes.decode('utf-8')
    )



if __name__ == "__main__":
    main()
