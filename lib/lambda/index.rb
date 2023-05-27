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
