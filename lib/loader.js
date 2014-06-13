var glob = require('glob'),
    minErr = require('./minErr').minErr,
    utils = require('./utils');

/**
 * @ngdoc interface
 * @name pongular.Module
 * @description
 *
 * Interface for configuring pongular {@link pongular.module modules}.
 */

exports.setupModuleLoader = function(pongular) {

  var $injectorMinErr = minErr('$injector');
  var ngMinErr = minErr('ng');

  function ensure(obj, name, factory) {
    return obj[name] || (obj[name] = factory());
  }

  // We need to expose `pongular.$$minErr` to modules such as `ngResource` that reference it during bootstrap
  pongular.$$minErr = pongular.$$minErr || minErr;

  /** @type {Object.<string, pongular.Module>} */
  var modules = {};

  pongular.unloadModule = pongular.unloadModule || function(name) {
    delete modules[name];
  };

  pongular.isModuleDefined = pongular.isModuleDefined || function(name) {
    return modules.hasOwnProperty(name);
  };

  return ensure(pongular, 'module', function() {

    /**
         * @ngdoc function
         * @name pongular.module
         * @description
         *
         * The `pongular.module` is a global place for creating, registering and retrieving Pongular
         * modules.
         * All modules (pongular core or 3rd party) that should be available to an application must be
         * registered using this mechanism.
         *
         * When passed two or more arguments, a new module is created.  If passed only one argument, an
         * existing module (the name passed as the first argument to `module`) is retrieved.
         *
         *
         * # Module
         *
         * A module is a collection of services, directives, filters, and configuration information.
         * `pongular.module` is used to configure the {@link AUTO.$injector $injector}.
         *
         * <pre>
         * // Create a new module
         * var myModule = pongular.module('myModule', []);
         *
         * // register a new service
         * myModule.value('appName', 'MyCoolApp');
         *
         * // configure existing services inside initialization blocks.
         * myModule.config(function($locationProvider) {
         *   // Configure existing providers
         *   $locationProvider.hashPrefix('!');
         * });
         * </pre>
         *
         * Then you can create an injector and load your modules like this:
         *
         * <pre>
         * var injector = pongular.injector(['ng', 'MyModule'])
         * </pre>
         *
         * However it's more likely that you'll just use
         * {@link ng.directive:ngApp ngApp} or
         * {@link pongular.bootstrap} to simplify this process for you.
         *
         * @param {!string} name The name of the module to create or retrieve.
         * @param {Array.<string>=} requires If specified then new module is being created. If
         *        unspecified then the the module is being retrieved for further configuration.
         * @param {Function} configFn Optional configuration function for the module. Same as
         *        {@link pongular.Module#methods_config Module#config()}.
         * @returns {module} new module with the {@link pongular.Module} api.
         */
    return function module(name, requires, configFn) {
      var assertNotHasOwnProperty = function(name, context) {
        if (name === 'hasOwnProperty') {
          throw ngMinErr('badname', 'hasOwnProperty is not a valid {0} name', context);
        }
      };

      assertNotHasOwnProperty(name, 'module');
      if (requires && modules.hasOwnProperty(name)) {
        modules[name] = null;
      }
      return ensure(modules, name, function() {
        if (!requires) {
          throw $injectorMinErr('nomod', "Module '{0}' is not available! You either misspelled " +
                                "the module name or forgot to load it. If registering a module ensure that you " +
                                "specify the dependencies as the second argument.", name);
        }

        /** @type {!Array.<Array.<*>>} */
        var invokeQueue = [];

        /** @type {!Array.<Function>} */
        var runBlocks = [];

        var config = invokeLater('$injector', 'invoke');

        /** @type {pongular.Module} */
        var moduleInstance = {
          // Private state
          _invokeQueue: invokeQueue,
          _runBlocks: runBlocks,

          /**
                     * @ngdoc property
                     * @name pongular.Module#requires
                     * @propertyOf pongular.Module
                     * @returns {Array.<string>} List of module names which must be loaded before this module.
                     * @description
                     * Holds the list of modules which the injector will load before the current module is
                     * loaded.
                     */
          requires: requires,

          /**
                     * @ngdoc property
                     * @name pongular.Module#name
                     * @propertyOf pongular.Module
                     * @returns {string} Name of the module.
                     * @description
                     */
          name: name,


          /**
                     * @ngdoc method
                     * @name pongular.Module#provider
                     * @methodOf pongular.Module
                     * @param {string} name service name
                     * @param {Function} providerType Construction function for creating new instance of the
                     *                                service.
                     * @description
                     * See {@link AUTO.$provide#provider $provide.provider()}.
                     */
          provider: invokeLater('$provide', 'provider'),

          /**
                     * @ngdoc method
                     * @name pongular.Module#factory
                     * @methodOf pongular.Module
                     * @param {string} name service name
                     * @param {Function} providerFunction Function for creating new instance of the service.
                     * @description
                     * See {@link AUTO.$provide#factory $provide.factory()}.
                     */
          factory: invokeLater('$provide', 'factory'),

          /**
                     * @ngdoc method
                     * @name pongular.Module#service
                     * @methodOf pongular.Module
                     * @param {string} name service name
                     * @param {Function} constructor A constructor function that will be instantiated.
                     * @description
                     * See {@link AUTO.$provide#service $provide.service()}.
                     */
          service: invokeLater('$provide', 'service'),

          /**
                     * @ngdoc method
                     * @name pongular.Module#value
                     * @methodOf pongular.Module
                     * @param {string} name service name
                     * @param {*} object Service instance object.
                     * @description
                     * See {@link AUTO.$provide#value $provide.value()}.
                     */
          value: invokeLater('$provide', 'value'),

          /**
                     * @ngdoc method
                     * @name pongular.Module#constant
                     * @methodOf pongular.Module
                     * @param {string} name constant name
                     * @param {*} object Constant value.
                     * @description
                     * Because the constant are fixed, they get applied before other provide methods.
                     * See {@link AUTO.$provide#constant $provide.constant()}.
                     */
          constant: invokeLater('$provide', 'constant', 'unshift'),

          /**
                     * @ngdoc method
                     * @name pongular.Module#config
                     * @methodOf pongular.Module
                     * @param {Function} configFn Execute this function on module load. Useful for service
                     *    configuration.
                     * @description
                     * Use this method to register work which needs to be performed on module loading.
                     */
          config: config,

          /**
                  * @ngdoc method
                  * @name pongular.Module#users
                  * @methoOf pongular.Module
                  * @description
                  * Use this method to load modules. Since nodejs requires modules to be required before they
                  * can be registered with the module, this method offers a shortcut to load in the modules of the app.
                  */
          uses: loadUses,

          /**
                     * @ngdoc method
                     * @name pongular.Module#run
                     * @methodOf pongular.Module
                     * @param {Function} initializationFn Execute this function after injector creation.
                     *    Useful for application initialization.
                     * @description
                     * Use this method to register work which should be performed when the injector is done
                     * loading all modules.
                     */
          run: function(block) {
            runBlocks.push(block);
            return this;
          }

        };

        if (configFn) {
          config(configFn);
        }

        return  moduleInstance;

        /**
          * @param {string} provider
          * @param {string} method
          * @param {String=} insertMethod
          * @returns {pongular.Module}
          */
        function invokeLater(provider, method, insertMethod) {
          return function() {
            invokeQueue[insertMethod || 'push']([provider, method, arguments]);
            return moduleInstance;
          };
        }

        /**
          * Requires any modules that match the given glob patterns
          */
        function loadUses() {
          var globs = Array.prototype.slice.call(arguments, 0);
          var path = require('path');
          utils.forEach(globs, function(patt) {
            var files = glob.sync(patt, {});
            utils.forEach(files, function(file) {
              require(path.join(process.cwd(), file));
            });
          });

          return moduleInstance;
        }
      });
    };
  });

}
