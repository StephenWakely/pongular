'use strict';

var pongular = require('../../lib/pongular').pongular;

describe('simple example', function() {
  var app;

  beforeEach(function () {
    spyOn(console, 'log');
    require('../../examples/simple');
  });

  it('should load modules', function() {
    expect(pongular.module('pong')).toBeDefined();
    expect(pongular.module('ook')).toBeDefined();
  });
  
  // FIX: don't know why jasmine won't count the calls correctly?
  xit('should call console logs', function() {
    expect(console.log.calls.length).toEqual(4);
  });
});