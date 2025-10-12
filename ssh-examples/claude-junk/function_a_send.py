"""
Function A: Send public key via POST
"""
import requests
from pathlib import Path


def send_public_key(endpoint_url, public_key_path):
    """
    Sends an SSH public key to an endpoint via POST.
    
    Args:
        endpoint_url: The URL to POST to
        public_key_path: Path to the SSH public key file
        
    Returns:
        Response object from requests
    """
    # Read the public key
    public_key = Path(public_key_path).expanduser().read_text().strip()
    
    # Send as form data
    response = requests.post(
        endpoint_url,
        data={'public_key': public_key}
    )
    
    return response


def main():
    response = send_public_key("http://localhost:5000/verify",
        "~/.ssh/id_rsa.pub"
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")


if __name__ == "__main__":
    main()
