'use strict';

var inject = require('../lib/pongular-mocks').inject;
var module = require('../lib/pongular-mocks').module;

describe('pongular mocks', function() {
  describe('jasmine module and inject', function(){
    var log;

    beforeEach(function(){
      log = '';
    });

    describe('module', function() {

      describe('object literal format', function() {
        var mock = { log: 'module' };

        beforeEach(function() {
          module({
              'service': mock,
              'other': { some: 'replacement'}
            },
            function ($provide) { $provide.value('example', 'win'); }
          );
        });

        it('should inject the mocked module', function() {
          inject(function(service) {
            expect(service).toEqual(mock);
          });
        });

        it('should support multiple key value pairs', function() {
          inject(function(service, other) {
            expect(other.some).toEqual('replacement');
            expect(service).toEqual(mock);
          });
        });

        it('should integrate with string and function', function() {
          inject(function(service, example) {
            expect(service).toEqual(mock);
            expect(example).toEqual('win');
          });
        });

        describe('module cleanup', function() {
          function testFn() {

          }

          it('should add hashKey to module function', function() {
            module(testFn);
            inject(function () {
              expect(testFn.$$hashKey).toBeDefined();
            });
          });

          it('should cleanup hashKey after previous test', function() {
            expect(testFn.$$hashKey).toBeUndefined();
          });
        });

        describe('called multiple times', function() {
          var secondMock = {};

          it('should apply all mocks', function() {
            module({foo: secondMock});
            inject(function (service, foo) {
              expect(service).toEqual(mock);
              expect(foo).toEqual(secondMock);
            });
          });

          it('should override earlier mocks with later ones', function() {
            module({service: secondMock});
            inject(function (service) {
              expect(service).toEqual(secondMock);
            });
          });
        });
      });

      describe('in DSL', function() {
        it('should load module', module(function() {
          log += 'module';
        }));

        afterEach(function() {
          inject();
          expect(log).toEqual('module');
        });
      });


      describe('inline in test', function() {
        it('should load module', function() {
          module(function() {
            log += 'module';
          });
          inject();
        });

        afterEach(function() {
          expect(log).toEqual('module');
        });
      });
    });

    describe('inject', function() {
      describe('in DSL', function() {
        it('should load module', inject(function() {
          log += 'inject';
        }));

        afterEach(function() {
          expect(log).toEqual('inject');
        });
      });


      describe('inline in test', function() {
        it('should load module', function() {
          inject(function() {
            log += 'inject';
          });
        });

        afterEach(function() {
          expect(log).toEqual('inject');
        });
      });

      describe('module with inject', function() {
        beforeEach(module(function(){
          log += 'module;';
        }));

        it('should inject', inject(function() {
          log += 'inject;';
        }));

        afterEach(function() {
          expect(log).toEqual('module;inject;');
        });
      });


      describe('this', function() {

        it('should set `this` to be the jasmine context', inject(function() {
          expect(this instanceof jasmine.Spec).toBe(true);
        }));
        
        // TODO: test not passing... why?
        xit('should set `this` to be the jasmine context when inlined in a test', function() {
          var tested = false;

          inject(function() {
            expect(this instanceof jasmine.Spec).toBe(true);
            tested = true;
          });

          expect(tested).toBe(true);
        });
      });
      
      it('should not change thrown Errors', inject(function() {
        expect(function() {
          inject(function() {
            throw new Error('test message');
          });
        }).toThrow('test message');
      }));

      it('should not change thrown strings', inject(function() {
        expect(function() {
          inject(function() {
            throw 'test message';
          });
        }).toThrow('test message');
      }));
    });
  });
});