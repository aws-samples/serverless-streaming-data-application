
# Building serverless applications with streaming data

This example application shows how to build flexible serverless backends for streaming data workloads. This sample application is called *Alleycat*.

The app is a home fitness system that allows users to compete in an intense series of 5-minute virtual bicycle races. Up to 1,000 racers at a time take the saddle and push the limits of cadence and resistance to set personal records and rank on leaderboards.

The software connects the stationary exercise bike with a backend application that processes the data from thousands of remote devices. The frontend allows users to configure their races and view real-time leaderboard and historical rankings.

To learn more about how this application works, see the 5-part series on the AWS Compute Blog:
* Part 1: https://aws.amazon.com/blogs/compute/building-serverless-applications-with-streaming-data-part-1/.
* Part 2: https://aws.amazon.com/blogs/compute/building-serverless-applications-with-streaming-data-part-2/.
* Part 3: TBD.
* Part 4: TBD.
* Part 5: TBD.

:warning: **Running this application will incur costs. It uses applications not in the AWS Free Tier and generates large numbers of messages.**

Important: this application uses various AWS services and there are costs associated with these services after the Free Tier usage - please see the [AWS Pricing page](https://aws.amazon.com/pricing/) for details. You are responsible for any AWS costs incurred. No warranty is implied in this example.

```bash
.
├── README.MD              <-- This instructions file
├── 0-setup                <-- Base AWS SAM templates for the application
├── 1-streaming-kds        <-- Example application for part 2 of the series
├── 2-streaming-kdf        <-- Example application for part 3 of the series
├── 3-streaming-kda        <-- Example application using Kinesis Data Analytics
├── frontend               <-- Source code for the Vue.js frontend application
├── simulator              <-- Application to generate data for testing
```

## Requirements

* An AWS account. ([Create an AWS account](https://portal.aws.amazon.com/gp/aws/developer/registration/index.html) if you do not already have one and login.)
* AWS CLI already configured with Administrator permission
* [AWS SAM CLI installed](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html) - **minimum version 0.48**.
* [NodeJS 14.x installed](https://nodejs.org/en/download/)
* [Vue.js and Vue CLI installed](https://vuejs.org/v2/guide/installation.html)

## Installation Instructions

1. Clone the repo onto your local development machine:
```
git clone https://github.com/aws-samples/serverless-streaming-data-application
```

### 1. Set up core template

1. From the command line, install the realtime messaging stack and Kinesis Data Streams stack:
```
cd ./0-setup/base-template/1-core
sam deploy --guided 
```
During the prompts, enter `streaming-app-core` for the stack name, enter your preferred Region, and accept the defaults for the remaining questions.

### 2. Set up DynamoDB table

1. From the command line, install the application's DynamoDB table using the AWS SAM template:
```
cd ../2-ddb
sam deploy --guided 
```
During the prompts, enter `streaming-app-ddb` for the stack name, enter your preferred Region, and accept the defaults for the remaining questions. Note the DynamoDB stream ARN output.

### 3. Set up APIs

1. From the command line, install the application's API functionaliy using the AWS SAM template:
```
cd ../3-api
sam deploy --guided 
```
During the prompts, enter `streaming-app-apis` for the stack name, enter your preferred Region, and answer Y to both questions `<<API>> may not have authorization defined, Is this okay? [y/N]`. Accept the defaults for the remaining questions. Note the API Gateway endpoint output.

### 4. Set up streaming examples

1. Change back to the route directory of the repo:
```
cd ../../..
```
2. Change directory, depending upon the example:
```
cd ./1-streaming-kds    <--- Kinesis Data Streams (see part 2 of the blog series)
cd ./2-streaming-kdf    <--- Kinesis Data Firehose (see part 3 of the blog series)
```
3. Deploy the AWS SAM template in the directory:
```
sam deploy --guided 
```
During the prompts, enter a stack name, your preferred Region, and accept the defaults for the remaining questions. 

3. Retrieve the IoT endpointAddress - note this for the frontend installation:
```
aws iot describe-endpoint --endpoint-type iot:Data-ATS
```
4. Retrieve the Cognito Pool ID - note this for the frontend installation:
```
aws cognito-identity list-identity-pools --max-results 10
```

### 5. Installing the frontend application

The frontend code is saved in the `frontend` subdirectory. 

1. Before running, you need to set environment variables in the `src\main.js` file:

- APIendpoint: this is the `APIendpoint` value earlier.
- PoolId: your Cognito pool ID from earlier.
- Host: your IoT endpoint from earlier.
- Region: your preferred AWS Region (e.g. us-east-1).

2. Change directory into the frontend code directory, and run the NPM installation:

```
cd ../frontend
npm install
```
3. After installation is complete, you can run the application locally:

```
npm run serve
```

### 6. Running the simulator

To deploy from the simulator directory:

1. Install the dependencies:
```
npm install
```
2. Modify the enviroment variables in `app.js` to reflect your template outputs and AWS Region.

- RACERS_MAX: set between 1 and 1000. Note that the higher the number, the more messages created, and the higher the cost.
- CLASS_ID: set to between 1 and 6. This should match the selected class ID in the front-end application.

3. Run the simulator:
```
node app.js
```
4. The simulator runs for 5 minutes.

## Optional stack: Kinesis Data Analytics

This stack shows how to create a Kinesis Data Anaytics consumer for the main Kinesis Data Stream. To deploy this example:

1. Change directory:
```
cd 3-streaming-kda    <--- Kinesis Data Analytics 
```
2. Deploy the AWS SAM template in the directory:
```
sam deploy --guided 
```
During the prompts, enter a stack name, your preferred Region, and accept the defaults for the remaining questions. 

3. After deployment, navigate to the Kinesis Data Analytics console and start the application.

4. Run the simulator to see calculated aggregates generated by the Kinesis Data Analytics application.

## Cleanup

1. Manually delete any objects in the application's S3 buckets.
2. Use the CloudFormation console to delete all the stacks deployed.

## Clearing the DynamoDB table

For testing and development purposes, the easiest way to clear all the data in a DynamoDB table is to delete the `streaming-app-ddb` stack and redeploy. This is why this resource is available as a separate stack to make it easy to clear the data.

## Avatars

The avatars used in this example application are created by the [Avatar Building package](https://www.npmjs.com/package/avatar-builder), used under the [Apache-2.0 license](https://www.apache.org/licenses/LICENSE-2.0). Use the following script to create multiple avatars icons with this package:

```
/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: MIT-0
 */

// Run this script to create icons for racers, using the Avatar Builder library (https://www.npmjs.com/package/avatar-builder?activeTab=readme)

const Avatar = require('avatar-builder')
const MAX_RACERS = 100

// Generate icons for racers
const fs = require ('fs')

const avatar = Avatar.builder(
    Avatar.Image.margin(Avatar.Image.roundedRectMask(Avatar.Image.compose(
    Avatar.Image.randomFillStyle(),
    Avatar.Image.shadow(Avatar.Image.margin(Avatar.Image.cat(), 8), {blur: 5, offsetX: 2.5, offsetY: -2.5,color:'rgba(0,0,0,0.75)'})
    ), 32), 8),
    128, 128)

const createIcon = (id) => {
    avatar.create(id).then(buffer => fs.writeFileSync(`./icons/${id}.png`, buffer))
}

for (let i = 1; i < MAX_RACERS; i++ )
    createIcon(i)
```


## Next steps

The AWS Compute Blog series  at the top of this README file contains additional information about the application design and architecture.

If you have any questions, please contact the author or raise an issue in the GitHub repo.

==============================================

Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.

SPDX-License-Identifier: MIT-0

