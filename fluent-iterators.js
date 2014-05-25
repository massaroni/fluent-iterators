'use strict';

var Js = require('./lib/js');
var Preconditions = require('precondition');
var _ = require('underscore');
var PriorityQueue = require('priorityqueuejs');
require('sugar');
var util = require('./lib/util');

var group = require('./lib/group');
var windowReducer = require('./lib/window');
var transformer = require('./lib/transformer');

exports.GroupingIterator = group.GroupingIterator;
exports.WindowReducerIterator = windowReducer.WindowReducerIterator;
exports.TransformerIterator = transformer.TransformerIterator;

/**
 * Build an iterator that iterates over an array once. This skips over any null or undefined elements,
 * and only returns null to indicate end-of-stream.
 *
 * @param content
 * @constructor
 */
exports.ArrayIterator = function (content) {
  Preconditions.checkType(_.isArray(content), 'Expected array content, but was %s', content);

  var i = 0;

  this.next = function () {
    while (i < content.length) {
      var item = content[i++];

      if (Js.isSomething(item)) {
        return item;
      }
    }

    return null;
  };
};

/**
 * Extending Array with an iterator() factory method, as syntactic sugar for instantiating new
 * iterators that iterate over arrays.
 *
 * @returns {Iterators.ArrayIterator}
 */
Array.prototype.iterator = function () {
  return new exports.ArrayIterator(this);
};

/**
 * Reduce contiguous equal objects returned by a delegate iterator.
 * This iterator will call ahead to the delegate iterator, and buffer the next item.
 *
 * @constructor
 */
exports.IteratorAggregator = function (delegateIterator, reduce, isEqual) {
  util.checkIsIterator(delegateIterator);
  Preconditions.checkType(_.isFunction(reduce), 'Undefined reducer function.');

  if (Js.isNothing(isEqual)) {
    isEqual = util.strictEquality;
  } else {
    Preconditions.checkType(_.isFunction(isEqual), 'Expected isEqual function, but was %s', isEqual);
  }

  var nextItem;
  var pullCount = 0;

  var pullNext = function () {
    var next = delegateIterator.next();
    pullCount++;
    return next;
  };

  this.next = function () {
    if (pullCount < 1) {
      nextItem = pullNext();
    }

    if (Js.isNothing(nextItem)) {
      return null;
    }

    var reduced = nextItem;

    var cursorItem = pullNext();

    while (isEqual(cursorItem, nextItem)) {
      reduced = reduce(cursorItem, reduced);
      cursorItem = pullNext();
    }

    nextItem = cursorItem;
    return reduced;
  };
};

var naturalComparatorDesc = function (lhs, rhs) {
  if (lhs < rhs) {
    return 1;
  }

  if (lhs === rhs) {
    return 0;
  }

  return -1;
};

var reverseComparator = function (comparator) {
  return function (lhs, rhs) {
    return - comparator(lhs, rhs);
  };
};

/**
 *
 * @param iterators - an array of iterators returning objects in the same sorted order
 * @param comparator - (optional) compares order of iterator output objects, in ascending order.
 * @constructor
 */
exports.SortedIteratorMerger = function (iterators, comparator) {
  Preconditions.checkType(_.isArray(iterators), 'Expected an array of iterators, but was %s', iterators);

  if (Js.isNothing(comparator)) {
    comparator = naturalComparatorDesc;
  } else {
    Preconditions.checkType(_.isFunction(comparator), 'Expected a comparator function, but was %s', comparator);
    comparator = reverseComparator(comparator);
  }

  iterators = iterators.clone(); // capture original iterator ordinals

  var wrapperComparator = function (lhs, rhs) {
    return comparator(lhs.item, rhs.item);
  };

  // initialize the buffer
  var buffer = new PriorityQueue(wrapperComparator);

  for (var i = 0; i < iterators.length; i++) {
    var iterator = iterators[i];
    util.checkIsIterator(iterator);
    var item = iterator.next();

    if (Js.isSomething(item)) {
      buffer.enq({index: i, item: item});
    }
  }

  // pull the next event from the cursors
  this.next = function () {
    if (buffer.size() < 1) {
      return null;
    }

    var wrapper = buffer.deq();

    if (Js.isNothing(wrapper)) {
      return null;
    }

    var sourceIndex = wrapper.index;
    var replacement = iterators[sourceIndex].next();

    if (Js.isSomething(replacement)) {
      buffer.enq({index: sourceIndex, item: replacement});
    }

    return wrapper.item;
  };
};

exports.MemoizedIteratorReplay = function (memoized) {
  Preconditions.checkType(memoized instanceof exports.MemoizedIterator);
  var index = 0;

  this.next = function () {
    return memoized.at(index++);
  };
};

/**
 * Record all items returned by an interator, so that another one can replay through
 * them later. The replayer can also iterate past the position of this iterator, in which case
 * the new items will be cached and ready for the subsequent next() call on this iterator.
 *
 * @param iterator
 * @constructor
 */
exports.MemoizedIterator = function (iterator) {
  util.checkIsIterator(iterator);

  var history = [];

  var pullNext = function () {
    var item = iterator.next();
    history.push(item);
    return item;
  };

  this.at = function (index) {
    Preconditions.check(Js.isIntegerNumber(index), 'Illegal index: %s', index);
    Preconditions.checkRange(index >= 0, 'Index out of bounds: %s', index);

    if (index < history.length) {
      return history[index];
    }

    if (index === history.length) {
      return pullNext();
    }

    throw new Error('Index out of bounds: ' + index);
  };

  this.replay = function () {
    return new exports.MemoizedIteratorReplay(this);
  };

  var cursor = this.replay();

  this.next = cursor.next;
};

/**
 * Use a wrapper to wrap custom iterators so that you can call fluent iterator functions on it.
 *
 * @param iterator
 * @constructor
 */
exports.IteratorWrapper = function (iterator) {
  util.checkIsIterator(iterator);

  this.next = function () {
    return iterator.next();
  };
};

/**
 * This is a superclass for all iterators, with fluent factory methods to layer on any other kind of iterator.
 *
 * @constructor
 */
exports.Iterator = function () {
};

exports.Iterator.prototype.toArray = function () {
  var buffer = [];
  var item = this.next();

  while (Js.isSomething(item)) {
    buffer.push(item);
    item = this.next();
  }

  return buffer;
};

exports.Iterator.prototype.aggregate = function (reducer, isEqual) {
  return new exports.IteratorAggregator(this, reducer, isEqual);
};

exports.Iterator.prototype.mergeSortedIterators = function (iterators, comparator) {
  Preconditions.checkType(_.isArray(iterators), 'Expected an array of iterators, but was %s', iterators);
  var allIterators = iterators.clone();
  allIterators.push(this);
  return new exports.SortedIteratorMerger(allIterators, comparator);
};

exports.Iterator.prototype.memoize = function () {
  return new exports.MemoizedIterator(this);
};

exports.Iterator.prototype.group = function (isSameGroup) {
  return new group.GroupingIterator(this, isSameGroup);
};

exports.Iterator.prototype.window = function (windowSize, reducer) {
  return new windowReducer.WindowReducerIterator(this, windowSize, reducer);
};

exports.Iterator.prototype.transform = function (transformerFunction) {
  return new transformer.TransformerIterator(this, transformerFunction);
};

// extend Iterator abstract class
Object.merge(exports.IteratorAggregator.prototype, exports.Iterator.prototype, false);
Object.merge(exports.SortedIteratorMerger.prototype, exports.Iterator.prototype, false);
Object.merge(exports.ArrayIterator.prototype, exports.Iterator.prototype, false);
Object.merge(exports.MemoizedIterator.prototype, exports.Iterator.prototype, false);
Object.merge(exports.MemoizedIteratorReplay.prototype, exports.Iterator.prototype, false);
Object.merge(exports.GroupingIterator.prototype, exports.Iterator.prototype, false);
Object.merge(exports.WindowReducerIterator.prototype, exports.Iterator.prototype, false);
Object.merge(exports.IteratorWrapper.prototype, exports.Iterator.prototype, false);
Object.merge(exports.TransformerIterator.prototype, exports.Iterator.prototype, false);

// utility functions
exports.mergeSortedIterators = function (iterators, comparator) {
  return new exports.SortedIteratorMerger(iterators, comparator);
};

exports.asIterator = function (iterator) {
  return new exports.IteratorWrapper(iterator);
};