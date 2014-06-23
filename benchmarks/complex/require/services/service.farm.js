'use strict';

var ServiceFarm = {};
var serviceAnimal;
var stock = [];

module.exports = function(ServiceAnimal) {
  if (ServiceAnimal) {
    serviceAnimal = ServiceAnimal;
  }
  
  ServiceFarm.addStock = function(color) {
    serviceAnimal.setColor(color);
    stock.push(serviceAnimal);
  };
  ServiceFarm.getStock = function() {
    return stock;
  };
  
  return ServiceFarm;
};