'use strict';

var pongular = require('../../../lib/pongular').pongular;

module.exports = pongular
  .module('service.animal', [])
  .service('ServiceAnimal', function() {
    this.cow = function(color) {
      return {
        color: color,
        age: 1,
        weight: 500
      };
    };
  })
;