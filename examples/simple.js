var pongular = require('../lib/pongular').pongular;

var ook = pongular.module('ook', []);
ook.constant('e', 1.7);

var pong = pongular.module('pong', ['ook']);
pong.constant('pi', 3.14);
pong.config(function(pi) {
  console.log('configging');
  console.log(pi);
});

var injector = pongular.injector(['pong']);

injector.invoke(['pi', 'e', function(pi, e) {
  console.log(pi);
  console.log(e);
}]);
