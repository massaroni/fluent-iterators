'use strict';

var util = require('./util');
var Preconditions = require('precondition');
var Js = require('./js');
var _ = require('underscore');

var ArrayReducer = function (sourceIterator, windowSize, reducer) {
  util.checkIsIterator(sourceIterator);
  Preconditions.checkRange(Js.isPositiveInteger(windowSize),
    'Reducer window size out of bounds: %s', windowSize);
  Preconditions.checkType(_.isFunction(reducer));

  this.source = sourceIterator;
  this.windowSize = windowSize;
  this.reducer = reducer;
  this.buffer = [];
};

ArrayReducer.prototype = {
  next: function () {
    var item = this.source.next();

    if (Js.isNothing(item)) {
      return null;
    }

    this.buffer.push(item);

    var reduced = this.buffer.reduce(this.reducer);

    if (this.buffer.length >= this.windowSize) {
      this.buffer.shift();
    }

    return reduced;
  }
};

var missingFunctionError = 'Accumulator missing %s function.';

var AccumulatorReducer = function (sourceIterator, windowSize, reducer) {
  util.checkIsIterator(sourceIterator);
  Preconditions.checkRange(Js.isPositiveInteger(windowSize),
    'Reducer window size out of bounds: %s', windowSize);
  Preconditions.checkType(_.isFunction(reducer.add), missingFunctionError, 'add(item)');
  Preconditions.checkType(_.isFunction(reducer.remove), missingFunctionError, 'remove(item)');
  Preconditions.checkType(_.isFunction(reducer.reduce), missingFunctionError, 'reducer()');

  this.source = sourceIterator;
  this.windowSize = windowSize;
  this.reducer = reducer;
  this.buffer = [];
};

AccumulatorReducer.prototype = {
  next: function () {
    var item = this.source.next();

    if (Js.isNothing(item)) {
      return null;
    }

    this.buffer.push(item);
    this.reducer.add(item);

    var reduced = this.reducer.reduce();

    if (this.buffer.length >= this.windowSize) {
      this.reducer.remove(this.buffer.shift());
    }

    return reduced;
  }
};

/**
 * Do a sliding-window aggregation on the output of a source iterator,
 * for example: calculating a moving-average. This emits one output for every input.
 *
 * @param sourceIterator
 * @param windowSize - the number of items to include in each run of the reducer.
 * @param reducer - either a function or an object.
 * 1) Function: reducer callback function that you would use in a native Array.reduce() call,
 * as per the mozilla documentation:
 * (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce)
 * This provides O(windowSize * n) time cost, because it runs through the window buffer in each iteration.
 *
 * 2) Object: must have 3 functions: add(item), remove(item), reduce()
 * This alternative gives the caller the option to have a better performance profile, if their
 * data type is amenable to accumulation, and they don't need to run through the window buffer in
 * each iteration, for example a cursor for computing the moving average of a series of numbers.
 *
 * This provides O(n) time cost, as long as the reducer object
 * provides O(1) time cost for add(), remove(), and reduce().
 *
 * @constructor
 */
exports.WindowReducerIterator = function (sourceIterator, windowSize, reducer) {
  var iterator;

  if (_.isFunction(reducer)) {
    iterator = new ArrayReducer(sourceIterator, windowSize, reducer);
  } else if (_.isObject(reducer)) {
    iterator = new AccumulatorReducer(sourceIterator, windowSize, reducer);
  } else {
    throw new TypeError('Expected a reducer function or accumulator object, but was %s', reducer);
  }

  this.next = function () {
    return iterator.next();
  };
};
