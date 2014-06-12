'use strict';

var loader = require('../lib/loader');

describe('module loader', function() {
  var pongular;

  beforeEach(function () {
    pongular = require('../lib/pongular').pongular; // calls setupModuleLoader internally
  });


  it('should set up namespace', function() {
    expect(pongular.module).toBeDefined();
  });


  it('should not override existing namespace', function() {
    var module = pongular.module;

    loader.setupModuleLoader(pongular);
    expect(pongular.module).toBe(module);
  });


  it('should record calls', function() {
    var otherModule = pongular.module('other', []);
    otherModule.config('otherInit');

    var myModule = pongular.module('my', ['other'], 'config');

    expect(myModule.
      provider('sk', 'sv').
      factory('fk', 'fv').
      service('a', 'aa').
      value('k', 'v').
      config('init2').
      constant('abc', 123).
      run('runBlock')).toBe(myModule);

    expect(myModule.requires).toEqual(['other']);
    expect(myModule._invokeQueue).toEqual([
      ['$provide', 'constant', {0: 'abc', 1: 123} ],
      ['$injector', 'invoke', {0 : 'config'} ],
      ['$provide', 'provider', {0: 'sk', 1: 'sv'} ],
      ['$provide', 'factory', {0: 'fk', 1: 'fv'} ],
      ['$provide', 'service', {0: 'a', 1: 'aa'} ],
      ['$provide', 'value', {0: 'k', 1: 'v'} ],
      ['$injector', 'invoke', {0 : 'init2'} ],
    ]);
    expect(myModule._runBlocks).toEqual(['runBlock']);
  });


  it('should allow module redefinition', function() {
    expect(pongular.module('a', [])).not.toBe(pongular.module('a', []));
  });


  it('should complain of no module', function() {
    expect(function() {
      pongular.module('dontExist');
    }).toThrow('[$injector:nomod] Module \'dontExist\' is not available! You either misspelled the module name or forgot to load it. If registering a module ensure that you specify the dependencies as the second argument.\nhttp://errors.angularjs.org/"NG_VERSION_FULL"/$injector/nomod?p0=dontExist');
  });

  it('should complain if a module is called "hasOwnProperty', function() {
    expect(function() {
      pongular.module('hasOwnProperty', []);
    }).toThrow('[ng:badname] hasOwnProperty is not a valid module name\nhttp://errors.angularjs.org/"NG_VERSION_FULL"/ng/badname?p0=module');
  });

  it('should expose `$$minErr` on the `angular` object', function() {
    expect(pongular.$$minErr).toEqual(jasmine.any(Function));
  });
});