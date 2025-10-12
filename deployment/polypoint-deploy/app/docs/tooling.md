# Tooling

The capabilities will be slightly offset to the standard functionality of other deployment tools, in a hopes to provide a more streamlined deployment process for both user and robots.

Usually we need ensure the server is setup correctly, then deploy the application. This tool will run these steps if required but this leads to a chicken-and-egg problem.

Therefore this tool should run from within the target server. Upon deployment the tool will run a _robot_ on the server - of which is just a bunch of scripts to run the deployment steps.
