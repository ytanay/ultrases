# ultrases [![Build Status](https://secure.travis-ci.org/ytanay/ultrases.png?branch=master)](http://travis-ci.org/ytanay/ultrases)

Dead simple email dispatch with AWS SES (Amazon Simple Email Service) with templates!

## Getting Started
Install the module with: `npm install ultrases`

```javascript
var UltraSES = require('ultrases');
var mailer = new UltraSES({...});
```

## Documentation

### Setup
Start by creating a new instance of UltraSES. Pass your access key for AWS in this fashion:
```javascript
var mailer = new UltraSES({
  aws: {
    accessKeyId: 'LOOKATHESEUPERCASELETTERANDNUMBERS123',
    secretAccessKey: 'shhhhits/asecret+42'
  }
}
```

You can also supply defaults for sending emails (for example, the "source" address)
```javascript
var mailer = new UltraSES({
  aws: {...},
  defaults: {from: 'Team Octocat <octo@octoland.com>'}
}
```
You can always override these defaults when you send the actual emails, of course.

### Sending a simple email
The basic method for sending email is ```mailer.sendText(email, text, done)``` and it takes (as you can probably see), 3 arguments):
```javascript
mailer.sendText({to: 'hexacat@hexaland.com', subject: 'Hello from Octoland!'}, 'Look at this fantastic email body!', function(err){
  if(err) throw err;
  console.log('email sent!');
}
```
Some notes:
+ The emails will be sent from __octo@octoland.com__, because we set that as a default during initialization.
+ You may include the message body in the "email" object instead of as an extra argument (i.e. ```{subject: '...', text: '..'}```)

## Examples
_(In a bit)_

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2014 Yotam Tanay. Licensed under the MIT license.
