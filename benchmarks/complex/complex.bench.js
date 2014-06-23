'use strict';

module.exports = {
  name: 'Complex',
  tests: {
    'NoPongular': function() {
      var serviceAnimal = require('./require/services/service.animal')();
      var ServiceFarm = require('./require/services/service.farm')(serviceAnimal);
      
      var myFarm = function(farm) {
        var color = 'brown';
        
        farm.addStock(color);
        farm.getStock();
      };
      
      myFarm(ServiceFarm);
    },
    'WithPongular': function() {
      var pongular = require('../../lib/pongular').pongular;
      
      pongular
        .module('myFarm', [
          'service.farm'
        ])
        .uses('benchmarks/complex/pongular/services/**/*.js')
        .constant('color', 'brown')
        .run(function(color, ServiceFarm) {
          ServiceFarm.addStock(color);
          ServiceFarm.getStock();
        })
      ;
      
      var injector = pongular.injector(['myFarm']);
    }
  }
};