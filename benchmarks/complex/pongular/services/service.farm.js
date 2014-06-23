'use strict';

var pongular = require('../../../../lib/pongular').pongular;

module.exports = pongular
  .module('service.farm', [
    'service.animal'
  ])
  .service('ServiceFarm', function(ServiceAnimal) {
    var stock = [];
    
    this.addStock = function(color) {
      ServiceAnimal.setColor(color);
      stock.push(ServiceAnimal);
    };
    this.getStock = function() {
      return stock;
    };
  })
;