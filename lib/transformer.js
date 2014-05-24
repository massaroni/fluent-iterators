'use strict';

var util = require('./util');
var Js = require('./js');
var Preconditions = require('precondition');
var _ = require('underscore');

exports.TransformerIterator = function (iterator, transformer) {
  util.checkIsIterator(iterator);
  Preconditions.checkType(_.isFunction(transformer), 'Expected transformer function, but was %s', transformer);

  this.next = function () {
    var item = iterator.next();

    if (Js.isNothing(item)) {
      return null;
    }

    return transformer(item);
  };
};
