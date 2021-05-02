# Welcome to your CDK TypeScript project!

This is a blank project for TypeScript development with CDK.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template

## Helpful to Remember Seth

### Recreate Gamma NAT Gateways

Due to cost, the NAT gateways in my gamma environment are deleted. If you want to test in gamma, you'll need to recreate them. You can do a diff of prod and gamma, but instructions below to help

1. Create a NAT gateway in each public subnet, make sure to allocate an elastic ip for each rather than using an existing ENI
2. Update the route tables on the private subnets to have a route for 0.0.0.0/0 to the NAT Gateways you create

Seeing some weird behavior after creating them manually, getting numerous Lambda ResourceNotReadyExceptions. After waiting a day, one of the functions came back online, but then the problem continues to persist for other functions.