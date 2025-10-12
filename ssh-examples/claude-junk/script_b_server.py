#!/usr/bin/env python3
"""
Script B: Server - Accepts and verifies SSH public key authentication via POST
"""

from flask import Flask, request, jsonify
import base64
import time
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.backends import default_backend
from cryptography.exceptions import InvalidSignature


app = Flask(__name__)

# Storage for authorized public keys (in production, use a database)
AUTHORIZED_KEYS = {}


def verify_ssh_signature(public_key_str, challenge, signature_b64):
    """
    Verifies the SSH key signature against the challenge.
    
    Args:
        public_key_str: SSH public key in OpenSSH format
        challenge: The challenge string that was signed
        signature_b64: Base64-encoded signature
        
    Returns:
        Boolean indicating if signature is valid
    """
    try:
        # Load the public key from OpenSSH format
        public_key = serialization.load_ssh_public_key(
            public_key_str.encode('utf-8'),
            backend=default_backend()
        )
        
        # Decode the signature
        signature = base64.b64decode(signature_b64)
        
        # Verify the signature
        public_key.verify(
            signature,
            challenge.encode('utf-8'),
            padding.PKCS1v15(),
            hashes.SHA256()
        )
        
        return True
    except InvalidSignature:
        return False
    except Exception as e:
        print(f"Error verifying signature: {e}")
        return False


def check_challenge_freshness(challenge, max_age_seconds=300):
    """
    Checks if the challenge is fresh (prevents replay attacks).
    
    Args:
        challenge: Challenge string in format "username:timestamp"
        max_age_seconds: Maximum age of challenge in seconds (default 5 minutes)
        
    Returns:
        Boolean indicating if challenge is fresh
    """
    try:
        _, timestamp_str = challenge.split(':', 1)
        timestamp = int(timestamp_str)
        current_time = int(time.time())
        
        # Check if timestamp is within acceptable range
        age = current_time - timestamp
        return 0 <= age <= max_age_seconds
    except (ValueError, IndexError):
        return False


@app.route('/auth', methods=['POST'])
def authenticate():
    """
    Authentication endpoint that verifies SSH key signatures.
    """
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    username = data.get('username')
    public_key = data.get('public_key')
    challenge = data.get('challenge')
    signature = data.get('signature')
    
    # Validate required fields
    if not all([username, public_key, challenge, signature]):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Check challenge freshness (prevent replay attacks)
    if not check_challenge_freshness(challenge):
        return jsonify({'error': 'Challenge expired or invalid'}), 401
    
    # Verify the challenge includes the correct username
    if not challenge.startswith(f"{username}:"):
        return jsonify({'error': 'Challenge does not match username'}), 401
    
    # Verify the signature
    if not verify_ssh_signature(public_key, challenge, signature):
        return jsonify({'error': 'Invalid signature'}), 401
    
    # Optional: Check if public key is in authorized keys list
    # if public_key not in AUTHORIZED_KEYS.get(username, []):
    #     return jsonify({'error': 'Public key not authorized'}), 403
    
    # Authentication successful
    return jsonify({
        'status': 'success',
        'message': 'Authentication successful',
        'username': username
    }), 200


@app.route('/register', methods=['POST'])
def register_key():
    """
    Optional endpoint to register authorized public keys.
    """
    data = request.get_json()
    
    username = data.get('username')
    public_key = data.get('public_key')
    
    if not all([username, public_key]):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Add key to authorized keys
    if username not in AUTHORIZED_KEYS:
        AUTHORIZED_KEYS[username] = []
    
    if public_key not in AUTHORIZED_KEYS[username]:
        AUTHORIZED_KEYS[username].append(public_key)
    
    return jsonify({
        'status': 'success',
        'message': 'Public key registered'
    }), 200


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({'status': 'healthy'}), 200


if __name__ == '__main__':
    print("Starting SSH Key Authentication Server...")
    print("Endpoints:")
    print("  POST /auth - Authenticate with SSH key")
    print("  POST /register - Register public key (optional)")
    print("  GET /health - Health check")
    app.run(host='0.0.0.0', port=5000, debug=True)
