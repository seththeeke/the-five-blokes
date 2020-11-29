To create a new email template, create a new json file as described at https://docs.aws.amazon.com/ses/latest/DeveloperGuide/send-personalized-email-api.html and use the below to add the template.

```
$ aws ses create-template --cli-input-json file://mytemplate.json
```

OR

```
aws ses update-template --cli-input-json file://mytemplate.json
```

Its easier to maintain the email template as an HTML file so once it is done in there, I move use https://www.textfixer.com/html/compress-html-compression.php to compress the html into a single line and then escape the string characters manually