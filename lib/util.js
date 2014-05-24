'use strict';

var Preconditions = require('precondition');
var _ = require('underscore');

exports.checkIsIterator = function (iterator) {
  Preconditions.checkType(_.isObject(iterator), 'Illegal iterator: Not an object.');
  Preconditions.checkType(_.isFunction(iterator.next), 'Illegal iterator: Missing next() function.');
};

exports.strictEquality = function (lhs, rhs) {
  return lhs === rhs;
};

