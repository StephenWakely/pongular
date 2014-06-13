# Pongular
[![Build Status](https://travis-ci.org/chesleybrown/pongular.svg?branch=master)](https://travis-ci.org/chesleybrown/pongular) [![Coverage Status](https://img.shields.io/coveralls/chesleybrown/pongular.svg)](https://coveralls.io/r/chesleybrown/pongular?branch=master) [![Dependency Status](https://david-dm.org/chesleybrown/pongular.svg)](https://david-dm.org/chesleybrown/pongular) [![devDependency Status](https://david-dm.org/chesleybrown/pongular/dev-status.svg)](https://david-dm.org/chesleybrown/pongular#info=devDependencies)

Pongular is the Angular JS dependency injection module ripped out for use on the server.

The way it works is similar to how it works on the client, with a few subtle differences.

## Installation

    $ npm install --save pongular

## Quick Start

First setup the module.

```js

var pongular = require('pongular').pongular;

var module = pongular.module('themodule', []);

```

Because in node js a module isn't loaded until it is required, pongular provides a shortcut to load the modules into the injector. Use glob patterns to specify the modules to be loaded and registered with the injector.

```js

module.uses('app/**/*.js',
            'config/*.js');

```

Setup your modules as you would in Angular. Because some of the module types don't make sense on the server, such as Controller and Directice - they aren't available. The following are :

- Provider
- Factory
- Service
- Constant
- Value

They follow the same rules as Angular js.

Then create the injector to kick things off :

```js
var injector = pongular.injector(['themodule']);
```

## Using Express

Say we want to wire up an app that uses express.

First create a factory that creates, sets up and returns the express object.

```js
pongular.module('themodule').factory('app', function() {
  var app = express();

  app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
  });

  app.configure('development', function(){
    app.use(express.errorHandler());
  });

  return app;
});

```

Lets create a controller, again a factory is good for this:

```js
pongular.module('themodule').factory('IndexCtrl', function() {
  return {
    index: function(req, res){
      res.render('index', { title: 'Express' });
    }
  };
});
```

Then lets wire it all up in the run method (Note because we are not minifying these files, you don't have to annotate your methods, just use the variable names directly as parameters. You can still annotate if you really wanted to):

```js
pongular.module('themodule').run(function(app, IndexCtrl) {
  app.get('/', IndexCtrl.index);

  http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
  });
});
```

And of course, kick it off (if you find your app exits straight after running, it is likely you have forgotten this step):

```js
var injector = pongular.injector(['themodule']);
```

Lets take things further. Say you have a model class that grabs data from an RSS feed.

```js
pongular.module('themodule').constant('RSSUrl', 'some funky url');
pongular.module('themodule').service('RSSFeed', function(RSSUrl) {
    // Do stuff that loads the feed from the url
    this.feed = [];
});
```

Then setup your controller:

```js
pongular.module('themodule').factory('RSSCtrl', function(RSSFeed) {
    return {
        list: function(res, req) {
            req.jsonp(RSSFeed.feed);
        }
    };
});
```

## Testing

Of course Dependecy Injection is only mildy useful until you start writing tests for your code. Pongular comes with pongular-mocks (ripped off from angular-mocks).

In your specs require pongular and pongular-mocks first, and then setup the module before requiring the module under test. An extra method `isModuleDefined` enables you to only setup the module once per test run :

```js
  var pongular = require('pongular').pongular,
      mocks = require('pongular/lib/pongular-mocks');

  if (!pongular.isModuleDefined('mongle')) pongular.module('mongle', []);
  require('../app/controllers/RSSCtrl');

  beforeEach(mocks.module('themodule'));
```

Then pongular-mocks gives you two methods:

`module` - This is where you provide the mock data to be injected into your class under test.
`inject` - This is where you pull out the class(es) under test from the injector.

The full test looks like :

```js
describe('RSS controller', function() {

  var pongular = require('pongular').pongular,
      mocks = require('pongular/lib/pongular-mocks');

  if (!pongular.isModuleDefined('themodule')) pongular.module('themodule', []);
  require('../app/controllers/RSSCtrl');

  beforeEach(mocks.module('themodule'));

  it ("Returns the RSS data", function() {

    mocks.module({'RSSFeed': {feed: ['interesting stuff',
                                    'boring stuff',
                                     'awesome stuff']}});


    mocks.inject(function(RSSCtrl) {
      var res = jasmine.createSpyObj('res', ['jsonp']);

      RSSCtrl.list(null, res);

      expect(res.jsonp).toHaveBeenCalledWith(['interesting stuff',
                                             'boring stuff',
                                             'awesome stuff']);
    });
  });
});
```

