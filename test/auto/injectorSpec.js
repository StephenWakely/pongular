'use strict';

var mocks = require('../../lib/pongular-mocks');
var _ = require('lodash');

describe('injector', function() {
  var providers;
  var injector;
  var providerInjector;

  beforeEach(mocks.module(function($provide, $injector) {
    providers = function(name, factory, annotations) {
      $provide.factory(name, _.extend(factory, annotations||{}));
    };
    providerInjector = $injector;
  }));
  beforeEach(mocks.inject(function($injector){
    injector = $injector;
  }));
  
  it("should return same instance from calling provider", function() {
    var instance = {},
        original = instance;
    providers('instance', function() { return instance; });
    expect(injector.get('instance')).toEqual(instance);
    instance = 'deleted';
    expect(injector.get('instance')).toEqual(original);
  });
  
  
  it('should inject providers', function() {
    providers('a', function() {return 'Mi';});
    providers('b', function(mi) {return mi+'sko';}, {$inject:['a']});
    expect(injector.get('b')).toEqual('Misko');
  });
  
  
  it('should resolve dependency graph and instantiate all services just once', function() {
    var log = [];

//          s1
//        /  | \
//       /  s2  \
//      /  / | \ \
//     /s3 < s4 > s5
//    //
//   s6


    providers('s1', function() { log.push('s1'); }, {$inject: ['s2', 's5', 's6']});
    providers('s2', function() { log.push('s2'); }, {$inject: ['s3', 's4', 's5']});
    providers('s3', function() { log.push('s3'); }, {$inject: ['s6']});
    providers('s4', function() { log.push('s4'); }, {$inject: ['s3', 's5']});
    providers('s5', function() { log.push('s5'); });
    providers('s6', function() { log.push('s6'); });

    injector.get('s1');

    expect(log).toEqual(['s6', 's3', 's5', 's4', 's2', 's1']);
  });
  
  
  it('should allow query names', function() {
    providers('abc', function () { return ''; });

    expect(injector.has('abc')).toBe(true);
    expect(injector.has('xyz')).toBe(false);
    expect(injector.has('$injector')).toBe(true);
  });


  it('should provide useful message if no provider', function() {
    expect(function() {
      injector.get('idontexist');
    }).toThrow('[$injector:unpr] Unknown provider: idontexistProvider <- idontexist\nhttp://errors.angularjs.org/"NG_VERSION_FULL"/$injector/unpr?p0=idontexistProvider%20%3C-%20idontexist');
  });


  it('should not corrupt the cache when an object fails to get instantiated', function() {
    expect(function() {
      injector.get('idontexist');
    }).toThrow('[$injector:unpr] Unknown provider: idontexistProvider <- idontexist\nhttp://errors.angularjs.org/"NG_VERSION_FULL"/$injector/unpr?p0=idontexistProvider%20%3C-%20idontexist');

    expect(function() {
      injector.get('idontexist');
    }).toThrow('[$injector:cdep] Circular dependency found: \nhttp://errors.angularjs.org/"NG_VERSION_FULL"/$injector/cdep?p0=');
  });


  it('should provide path to the missing provider', function() {
    providers('a', function(idontexist) {return 1;});
    providers('b', function(a) {return 2;});
    expect(function() {
      injector.get('b');
    }).toThrow('[$injector:unpr] Unknown provider: idontexistProvider <- idontexist <- a <- b\nhttp://errors.angularjs.org/"NG_VERSION_FULL"/$injector/unpr?p0=idontexistProvider%20%3C-%20idontexist%20%3C-%20a%20%3C-%20b');
  });


  it('should create a new $injector for the run phase', mocks.inject(function($injector) {
    expect($injector).not.toBe(providerInjector);
  }));
});
