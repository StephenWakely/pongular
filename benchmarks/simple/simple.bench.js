'use strict';

module.exports = {
  name: 'Simple',
  tests: {
    'NoPongular': function() {
      var engineFactory = function() {
        var engine = {
          power: 1.7,
          fuel: 300,
          weight: 500
        };
        
        return engine;
      };
      
      var vehicleFactory = function(engine) {
        var vehicle = {
          engine: engine,
          tires: 4,
          color: 'black'
        };
        
        vehicle.start =function() {
          this.on = true;
        };
        
        vehicle.isOn =function() {
          return this.on;
        };
        
        return vehicle;
      };
      
      var myCar = function(vehicle) {
        var myCar = vehicle;
        myCar.start();
      };
      
      var engine = engineFactory();
      var vehicle = vehicleFactory(engine);
      myCar(vehicle);
    },
    'WithPongular': function() {
      var pongular = require('../../lib/pongular').pongular;
      
      pongular
        .module('engine', [])
        .factory('engine', function() {
          var engine = {
            power: 1.7,
            fuel: 300,
            weight: 500
          };
          return engine;
        })
      ;
      
      pongular
        .module('vehicle', ['engine'])
        .factory('vehicle', function(engine) {
          var vehicle = {
            engine: engine,
            tires: 4,
            color: 'black',
            on: false
          };
          
          vehicle.start =function() {
            this.on = true;
          };
          
          vehicle.isOn =function() {
            return this.on;
          };
          
          return vehicle;
        })
      ;
      
      pongular
        .module('myCar', [
          'vehicle'
        ])
        .run(function(vehicle) {
          var myCar = vehicle;
          myCar.start();
        })
      ;
      
      pongular.injector(['myCar']);
    }
  }
};