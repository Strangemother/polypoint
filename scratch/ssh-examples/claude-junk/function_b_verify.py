"""
Function B: Verify public key against private key
"""
from pathlib import Path
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.backends import default_backend
from cryptography.exceptions import UnsupportedAlgorithm


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


def main():
    # Simulate receiving public key from POST
    received_public_key = Path("~/.ssh/id_rsa.pub").expanduser().read_text().strip()
    
    # Verify against your private key
    is_valid = verify_key_pair(
        received_public_key,
        "~/.ssh/id_rsa"
    )
    
    print(f"Key pair valid: {is_valid}")


if __name__ == "__main__":
    main()
