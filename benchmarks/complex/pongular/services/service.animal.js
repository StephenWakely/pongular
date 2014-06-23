'use strict';

var pongular = require('../../../../lib/pongular').pongular;

module.exports = pongular
  .module('service.animal', [])
  .factory('ServiceAnimal', function() {
    var cow = {
      color: null,
      age: 1,
      weight: 500
    };
    
    cow.setColor = function(color) {
      this.color = color;
    };
    
    return cow;
  })
;