import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import { Duration } from 'aws-cdk-lib';

export class Demo1Stack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'MyBucket', {
      versioned: true,
    });

    const lambdaFn = new lambda.Function(this, 'MyLambda', {
      runtime: lambda.Runtime.RUBY_2_7,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'lambda')),
      environment: {
        BUCKET_NAME: bucket.bucketName,
      },
      timeout: Duration.seconds(10),
    });

    bucket.grantWrite(lambdaFn);

    new cdk.CfnOutput(this, 'BucketName', { value: bucket.bucketName });
    new cdk.CfnOutput(this, 'LambdaFunctionName', { value: lambdaFn.functionName });
  }
}
