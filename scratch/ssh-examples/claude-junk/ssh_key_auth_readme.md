# SSH Key Authentication PoC

This proof-of-concept demonstrates SSH public key authentication via HTTP POST.

## Overview

- **script_a_client.py**: Client that sends authentication requests with SSH key signatures
- **script_b_server.py**: Server that verifies SSH key signatures

## Requirements

Install the required dependencies:

```bash
pip install flask requests cryptography
```

## How It Works

1. **Client (Script A)**:
   - Loads a private SSH key
   - Creates a challenge (username + timestamp)
   - Signs the challenge with the private key
   - Sends the public key, challenge, and signature to the server

2. **Server (Script B)**:
   - Receives the POST request with public key, challenge, and signature
   - Verifies the challenge is fresh (prevents replay attacks)
   - Verifies the signature using the provided public key
   - Returns success or failure

## Usage

### 1. Start the Server (Script B)

```bash
python script_b_server.py
```

The server will start on `http://localhost:5000`

### 2. Generate SSH Keys (if needed)

```bash
ssh-keygen -t rsa -b 2048 -f test_key -N ""
```

This creates:
- `test_key` (private key)
- `test_key.pub` (public key)

### 3. Run the Client (Script A)

```bash
python script_a_client.py test_key http://localhost:5000/auth
```

## API Endpoints

### POST /auth
Authenticate with SSH key signature.

**Request Body:**
```json
{
  "username": "user",
  "public_key": "ssh-rsa AAAAB3...",
  "challenge": "user:1234567890",
  "signature": "base64_encoded_signature"
}
```

**Response (Success):**
```json
{
  "status": "success",
  "message": "Authentication successful",
  "username": "user"
}
```

### POST /register (Optional)
Register authorized public keys.

**Request Body:**
```json
{
  "username": "user",
  "public_key": "ssh-rsa AAAAB3..."
}
```

### GET /health
Health check endpoint.

## Security Features

1. **Replay Attack Prevention**: Challenge includes timestamp, verified to be fresh (5-minute window)
2. **Signature Verification**: Uses cryptographic signature verification
3. **No Private Key Transmission**: Only public key and signature are sent
4. **Challenge Binding**: Challenge must match the username

## Integration Example

### Client Function (for your endpoint)

```python
from script_a_client import send_auth_request

# Use in your code
response = send_auth_request(
    private_key_path="~/.ssh/id_rsa",
    server_url="https://your-server.com/auth",
    username="your_username"
)

if response and response.status_code == 200:
    print("Authenticated successfully!")
```

### Server Function (for your endpoint)

```python
from script_b_server import verify_ssh_signature, check_challenge_freshness

# Use in your Flask/FastAPI route
@app.route('/your-auth-endpoint', methods=['POST'])
def your_auth_handler():
    data = request.get_json()
    
    # Verify challenge freshness
    if not check_challenge_freshness(data['challenge']):
        return jsonify({'error': 'Expired'}), 401
    
    # Verify signature
    if not verify_ssh_signature(
        data['public_key'],
        data['challenge'],
        data['signature']
    ):
        return jsonify({'error': 'Invalid signature'}), 401
    
    # Your authentication logic here
    return jsonify({'status': 'success'}), 200
```

## Notes

- For production, use HTTPS to encrypt the transmission
- Store authorized keys in a database, not in memory
- Consider adding rate limiting
- Add proper logging and monitoring
- For encrypted private keys, pass the password parameter to `load_ssh_private_key()`

## Testing

1. Start the server in one terminal
2. Run the client in another terminal
3. Check the server logs to see the verification process

Example successful output:
```
Status Code: 200
Response: {'status': 'success', 'message': 'Authentication successful', 'username': 'user'}
```
