#!/usr/bin/env python3
"""
Script A: Client - Sends SSH public key authentication via POST
"""

import requests
import hashlib
import base64
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.backends import default_backend


def send_auth_request(private_key_path, server_url, username="user"):
    """
    Sends an authentication request with SSH key pair verification.
    
    Args:
        private_key_path: Path to the SSH private key file
        server_url: URL of the authentication endpoint
        username: Username for identification
        
    Returns:
        Response object from the server
    """
    # Load the private key
    with open(private_key_path, 'rb') as key_file:
        private_key = serialization.load_ssh_private_key(
            key_file.read(),
            password=None,  # Add password parameter if key is encrypted
            backend=default_backend()
        )
    
    # Get the corresponding public key
    public_key = private_key.public_key()
    
    # Serialize public key to OpenSSH format
    public_key_bytes = public_key.public_bytes(
        encoding=serialization.Encoding.OpenSSH,
        format=serialization.PublicFormat.OpenSSH
    )
    public_key_str = public_key_bytes.decode('utf-8')
    
    # Create a challenge message (timestamp + username)
    import time
    timestamp = str(int(time.time()))
    challenge = f"{username}:{timestamp}"
    
    # Sign the challenge with the private key
    signature = private_key.sign(
        challenge.encode('utf-8'),
        padding.PKCS1v15(),
        hashes.SHA256()
    )
    
    # Encode signature to base64 for transmission
    signature_b64 = base64.b64encode(signature).decode('utf-8')
    
    # Prepare the POST data
    payload = {
        'username': username,
        'public_key': public_key_str,
        'challenge': challenge,
        'signature': signature_b64
    }
    
    # Send POST request
    try:
        response = requests.post(server_url, json=payload, timeout=10)
        return response
    except requests.exceptions.RequestException as e:
        print(f"Error sending request: {e}")
        return None


if __name__ == "__main__":
    # Example usage
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python script_a_client.py <path_to_private_key> [server_url]")
        print("Example: python script_a_client.py ~/.ssh/id_rsa http://localhost:5000/auth")
        sys.exit(1)
    
    private_key_path = sys.argv[1]
    server_url = sys.argv[2] if len(sys.argv) > 2 else "http://localhost:5000/auth"
    
    print(f"Sending authentication request to {server_url}...")
    response = send_auth_request(private_key_path, server_url)
    
    if response:
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
    else:
        print("Failed to send request")
