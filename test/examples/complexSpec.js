'use strict';

var pongular = require('../../lib/pongular').pongular;

describe('complex example', function() {
  var app;

  beforeEach(function () {
    require('../../examples/complex/index');
  });

  it('should load modules', function() {
    expect(pongular.isModuleDefined('app')).toBeTruthy();
    expect(pongular.isModuleDefined('service.farm')).toBeTruthy();
    expect(pongular.isModuleDefined('service.animal')).toBeTruthy();
  });
});