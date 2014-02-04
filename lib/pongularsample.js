var pongular = require('./pongular').pongular;
var createInjector = require('./injector').createInjector;

var ook = pongular.angular.module('ook', []);
ook.constant('e', 1.7);

var pong = pongular.angular.module('pong', ['ook']);
pong.constant('pi', 3.14);
pong.config(function(pi) {
    console.log('configging');
    console.log(pi);
});

var injector = createInjector(['pong']);

injector.invoke(['pi', 'e', function(pi, e) {
    console.log(pi);
    console.log(e);
}]);
