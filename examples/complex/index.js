'use strict';

var pongular = require('../../lib/pongular').pongular;

pongular
  .module('app', [
    'service.farm'
  ])
  .uses('examples/complex/services/**/*.js')
  .constant('color', 'brown')
  .config(function(color) {
    // do some config
  }
);

var injector = pongular.injector(['app']);

injector.invoke(['color', 'ServiceFarm', function(color, ServiceFarm) {
  ServiceFarm.addStock(color);
  ServiceFarm.getStock();
}]);
