'use strict';

var pongular = require('../../../lib/pongular').pongular;

module.exports = pongular
  .module('service.farm', [
    'service.animal'
  ])
  .service('ServiceFarm', function(ServiceAnimal) {
    var stock = [];
    
    this.addStock = function(color) {
      stock.push(ServiceAnimal.cow(color));
    };
    this.getStock = function() {
      return stock;
    };
  })
;