# ultrases [![Build Status](https://secure.travis-ci.org/ytanay/ultrases.png?branch=master)](http://travis-ci.org/ytanay/ultrases) [![NPM version](https://badge.fury.io/js/ultrases.png)](http://badge.fury.io/js/ultrases)

Dead simple email dispatch with AWS SES (Amazon Simple Email Service) with templates!

## Getting Started
Install the module via [npm](https://www.npmjs.org/package/ultrases) with: `npm install ultrases`

```javascript
var UltraSES = require('ultrases');
var mailer = new UltraSES({...});
```

## Why?
> We already have an SDK for Node, why do we need yet another module?

Because the official AWS SDK for Node.js is cumbersome and over-complicated for simple tasks. That's exactly the sort of things we have high level abstractions for. Besides, they uppercase the first letter of their properties.
```javascript
  var params = {WhoEvenDoesThat: 'nobody'}
```

## Documentation

### Quick Reference:
- [Setup](#what-is-cargomaster)
- [Sending a Simple Email](#sending-a-simple-email)
- [Sending Raw HTML](#sending-raw-html)
- [Sending a Pretty Jade Template](#sending-a-pretty-jade-template)
- [One Last Thing](#one-last-thing)

### Setup
Start by creating a new instance of UltraSES. Pass your access key for AWS in this fashion:
```javascript
var mailer = new UltraSES({
  aws: {
    accessKeyId: 'LOOKATHESEUPERCASELETTERANDNUMBERS123',
    secretAccessKey: 'shhhh+its/asecrettttttttt+42'
  }
}
```
Alternatively, you may pass a "pre-initialized" AWS SDK object like so:
```javascript
var aws = require('aws-sdk');
AWS.config.update({...});
var mailer = new UltraSES({sdk: aws});
```
You can even pass in an initialized SES client object:
```javascript
var ses = new aws.SES();
var mailer = new UltraSES({client: ses});
```

You can also supply defaults for sending emails (for example, the "source" address)
```javascript
var mailer = new UltraSES({
  aws: {...},
  defaults: { from: 'Team Octocat <octo@octoland.com>' }
}
```
You can always override these defaults when you send the actual emails, of course.

Keep in mind that the parameters you give to various methods adhere to the principles in the AWS SDK for Node. You can pass an array instead of a string for multiple recipients, specify a `ReplyTo` and `ReturnPath` address, specify character encodings, and so on.

### Sending a Simple Email
The basic method for sending email is ```mailer.sendText(email, text, done)``` and it takes (as you can probably see), 3 arguments:
```javascript
var email = {to: 'hexacat@hexaland.com', subject: 'Hello from Octoland!'};
mailer.sendText(email, 'Look at this fantastic email body!', function(err){
    if(err) throw err;
    console.log('email sent!');
  });
```
Some notes:
+ The emails will be sent from __octo@octoland.com__, because we set that as a default during initialization.
+ You may include the message body in the "email" object instead of as an extra argument ```var email = {subject: '...', text: '..'}```)
+ You may send an email to multiple recipients by passing in an array instead of a string to `to`, as well as provide BCC and CC recipients.

### Sending Raw HTML
UltraSES provides a simple wrapper for sending HTML emails. The cool thing about this is that it automatically creates a text version of your HTML for simpler email clients, using [html-to-text](https://www.npmjs.org/package/html-to-text).
```javascript
var email = { from: 'quadrocat@quadworld.com', to: 'htmlcat@hexaland.com', subject: 'Look at this pretty formatting!' };
mailer.sendHTML(email, '<h1>Why hello there</h1>', function(err){
  if(err) throw err;
  console.log('html email sent!');
});
```
+ In this example, we overrode the "from" address that we set during initialization.

### Sending a Pretty Jade Template
[Jade](http://jade-lang.com/) is one of the most popular templating engines for Node. UltraSES comes with out of the box support for compiling Jade templates with your "locals" and sending them.
```javascript
var email = { to: 'htmlcat@hexaland.com', subject: 'Now that\'s a pretty email' };
var template = { file: './path/to/template.jade', locals: { some: 'local', variables: 'here' } };
mailer.sendTemplate(email, template, function(err){
  if(err) throw err;
  console.log('compiled template email sent');
})
```
+ If you already have compiled template file, just pass it to ```mailer.sendHTML```.
+ You may pass the contents of Jade template instead of the file path, by using the property `contents` instead of `file`: 
```javascript
var template = { contents: ('html' + '\n\t' + 'body' + '\n\t\t' + 'h1 ' + 'Oh, it\'s you again') };
```

### One Last Thing
UltraSES exposes it's internal SES client as provided by the AWS SDK under the property `ses`, so you can do things like:
```javascript
mailer.ses.setIdentityFeedbackForwardingEnabled({ForwardingEnabled: true, Identity: 'WhatIsUpWithThese@UpperCaseLetters.com'}, function(err, data){}), 
```

## Examples
_(There are examples in the documentation section, but I'll add some more soon)_

## Contributing
Honestly, this module doesn't have much room to grow. It does what it does and aside for bugs (and maybe customizable template engine support?) there isn't much to expand. If you have some cool ideas though, go ahead and do a pull request, or create an issue with your idea! 

It's just email, after all. This is '90s technology we're dealing with.

I'll also leave this here: it's impossible to write unit tests for a module that sends email. Fact.

## Release History
The latest version is always on [npm](https://www.npmjs.org/package/ultrases). You can see the tagged versions [here](https://github.com/ytanay/ultrases/releases) or view the commits [here](https://github.com/ytanay/ultrases/commits/master).

## License
Copyright (c) 2014 Yotam Tanay. Licensed under the MIT license.
