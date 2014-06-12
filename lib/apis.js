/*global require: false, module: false */

var utils = require('./utils'),
    uid = ['0', '0', '0'];

/**
 * A consistent way of creating unique IDs in angular. The ID is a sequence of alpha numeric
 * characters such as '012ABC'. The reason why we are not using simply a number counter is that
 * the number string gets longer over time, and it can also overflow, where as the nextId
 * will grow much slower, it is a string, and it will never overflow.
 *
 * @returns {string} an unique alpha-numeric string
 */
function nextUid() {
  var index = uid.length;
  var digit;

  while(index) {
    index--;
    digit = uid[index].charCodeAt(0);
    if (digit == 57 /*'9'*/) {
      uid[index] = 'A';
      return uid.join('');
    }
    if (digit == 90  /*'Z'*/) {
      uid[index] = '0';
    } else {
      uid[index] = String.fromCharCode(digit + 1);
      return uid.join('');
    }
  }
  uid.unshift('0');
  return uid.join('');
}


/**
 * Computes a hash of an 'obj'.
 * Hash of a:
 *  string is string
 *  number is number as string
 *  object is either result of calling $$hashKey function on the object or uniquely generated id,
 *         that is also assigned to the $$hashKey property of the object.
 *
 * @param obj
 * @returns {string} hash string such that the same input will have the same hash string.
 *         The resulting string key is in 'type:hashKey' format.
 */
function hashKey(obj) {
    var objType = typeof obj,
        key;

    if (objType == 'object' && obj !== null) {
        if (typeof (key = obj.$$hashKey) == 'function') {
            // must invoke on object to keep the right this
            key = obj.$$hashKey();
        } else if (key === undefined) {
            key = obj.$$hashKey = nextUid();
        }
    } else {
        key = obj;
    }

    return objType + ':' + key;
}

/**
 * HashMap which can use objects as keys
 */
function HashMap(array){
    utils.forEach(array, this.put, this);
}
HashMap.prototype = {
    /**
     * Store key value pair
     * @param key key to store can be any type
     * @param value value to store can be any type
     */
    put: function(key, value) {
        this[hashKey(key)] = value;
    },

    /**
     * @param key
     * @returns the value for the key
     */
    get: function(key) {
        return this[hashKey(key)];
    },

    /**
     * Remove the key/value pair
     * @param key
     */
    remove: function(key) {
        var value = this[key = hashKey(key)];
        delete this[key];
        return value;
    }
};

module.exports.HashMap = HashMap;

