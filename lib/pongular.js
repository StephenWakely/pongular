/*global exports: false, require: false */
var loader = require('./loader')
    injector = require('./injector');

var pongular = {};

var pongularModule = loader.setupModuleLoader(pongular);

pongular.injector = injector(pongularModule).createInjector;

exports.pongular = pongular;