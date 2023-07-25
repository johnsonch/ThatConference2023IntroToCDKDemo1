# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template

## Install CDK and Typescript
This repository assumes you already have Node/NPM installed

`npm install -g aws-cdk`
`npm install -g typescript`

---
## Setup
Setup the first project first create a directory and `cd` into it. I used `demo1`

```
cdk init app --language typescript
```
The `cdk init` takes a template and then a `--language` flag. We're using the `app` template and working in Typescript today

Then go and setup your AWS account with the information from your desired user.

`aws configure`

---

## Bootstraping CDK
Now we need to bootstrap our envionrment

```
cdk bootstrap
```

---
## Add some code
Now we can try add our code

Let's open up `lib/demo1-stack.ts` and start by adding our S3 bucket

```
const bucket = new s3.Bucket(this, 'MyBucket', {
  versioned: true,
});
```

For that to work we'll also need to import the  S3 library
```
import * as s3 from 'aws-cdk-lib/aws-s3';
```

Let's take a look at deploying this. Here is my workflow:
* `cdk diff --all`
* `cdk deploy --all`

There are some other tools like `synthesize` TODO explain the other options with `cdk`

But we don't have any errors so lets :fire: :arrow_lower_right: :hole: with `cdk deploy --all`

Sweet that worked! Let's go on to a little more complex portion and we'll add the lambda function that writes to the bucket.

We're going to keep the lambda CDK code in the same file, at least for this example it will help us understand what we are doing.

Let's start by creating the Lambda, we'll use Ruby for this example.

Create a file `lib/lambda/index.rb` and add the following to the file:

```
require 'aws-sdk'

def handler(event:, context:)
  # The name of the bucket passed in by the creation of the function
  bucket = ENV['BUCKET_NAME']
  # Create a timestamp file name
  timestamp = Time.now.utc.strftime('%Y%m%dT%H%M%S%z')
  file_name = "timestamp-#{timestamp}.txt"

  # Write the timestamp file to S3
  s3 = Aws::S3::Client.new
  s3.put_object(bucket: bucket, key: file_name, body: timestamp)

  # Return a success response
  { statusCode: 200, body: 'Timestamp file written to S3' }
end
```

Now we can get the lambda function created and have it use the code we just wrote. In our `lib/demo1-stack.ts` file at the top add:

```
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import { Duration } from 'aws-cdk-lib';
```


Now below our S3 bucket lets add the following:

```
const lambdaFn = new lambda.Function(this, 'MyLambda', {
  runtime: lambda.Runtime.RUBY_2_7,
  handler: 'index.handler',
  code: lambda.Code.fromAsset(path.join(__dirname, 'lambda')),
  environment: {
    BUCKET_NAME: bucket.bucketName,
  },
  timeout: Duration.seconds(10),
});
```

Let's deploy this out, generate our diff first then deploy

Now we can try and run the funcation in the UI

Oops needs permissions to write to the bucket. This is where we learn that eventhough our code deploys fine it may not "work" as expected

Let's add `bucket.grantWrite(lambdaFn);` and then re-diff and deploy

Now we can create a test event and trigger our Lamda.
