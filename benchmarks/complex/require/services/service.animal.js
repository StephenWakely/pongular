'use strict';

module.exports = function() {
  var cow = {
    color: null,
    age: 1,
    weight: 500
  };
  
  cow.setColor = function(color) {
    this.color = color;
  };
  
  return cow;
};