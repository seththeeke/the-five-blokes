To create a new email template, create a new json file as described at https://docs.aws.amazon.com/ses/latest/DeveloperGuide/send-personalized-email-api.html and use the below to add the template.

```
$ aws ses create-template --cli-input-json file://mytemplate.json
```

OR

```
aws ses update-template --cli-input-json file://mytemplate.json
```

e.g
```
aws ses update-template --cli-input-json file://gameweek-completed-email-template.json
```

Its easier to maintain the email template as an HTML file so once it is done in there, I move use https://www.textfixer.com/html/compress-html-compression.php to compress the html into a single line and then escape the string characters manually by pasting the output into the helloWorld file and do a string replace from " to \"

The templates are dependent on icons being available and need to be uploaded to the assets s3 bucket.

```
aws s3 ls
aws s3 sync email-icons/ s3://<bucket_name> --acl public-read
// gamma 
aws s3 sync email-icons/ s3://fantasyinfrastack-mediaassetsbucketd4253741-1srfmprg1dt8c --acl public-read
// prod
aws s3 sync email-icons/ s3://fantasyinfrastack-mediaassetsbucketd4253741-1r3c3j7im1h2w --acl public-read --profile lotm --region us-east-1
```