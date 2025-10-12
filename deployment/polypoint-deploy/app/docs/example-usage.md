# Example Usage

+ **left-side**: The deployment tool on the initiator system, such as the developers local machine, or a CI/CD system.
+ **right-side**: The target system, such as a fresh Ubuntu server, but specifically referring to _this tools_ target system.
+ **Initiator**: The system that initiates the deployment, usually the left-side system, AKA _local_, developer, client. Generally the _left-side_ system.
+ **Target**: The system that is the target of the deployment, usually the right-side system, AKA _remote_, server, production. Generally the _right-side_ system.
+ **DIE**: Deployment Integrated Environment - A moniker used to refer to the suite of tools used for deployment, including its interface.


> For this example we'll use Windows as the left-side system, and Ubuntu as the right-side system to make it easy to follow.

Install the deployment tool. We assume basic python (because it's on ubuntu by default):

```bash
https://myendpoint/grab-bot | bash
```

This receives the installation script, of which downloads the deployment tool, and runs it.

If the system is automated, the _left side_ tool must be run as root (e.g. via sudo). This is done through a pre-config of the site setup.

Left side (initiator system):

```bash
$> deploy-tool -f myapp/deploy/config.yaml
# ... Reading new config
```

This will inspect the deployment config, and determine the target system (e.g. IP address, domain name, etc). and perform a connection.
