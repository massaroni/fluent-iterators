'use strict';

var Js = require('./js');
var util = require('./util');
var Preconditions = require('precondition');
var _ = require('underscore');

/**
 * Group consecutive items pulled out of a source iterator.
 * This iterator returns arrays of consecutive items that belong to the same group, according to the callback function.
 *
 * @param sourceIterator
 * @param isSameGroup - (optional) takes 2 parameters. returns true if they belong to the same group,
 * or false if they don't.
 * By default, we use a strict equality function, if isSameGroup is not provided:
 *  function (lhs, rhs) {
 *    return lhs === rhs;
 *  }
 * @constructor
 */
exports.GroupingIterator = function (sourceIterator, isSameGroup) {
  util.checkIsIterator(sourceIterator);

  if (Js.isNothing(isSameGroup)) {
    isSameGroup = util.strictEquality;
  } else {
    Preconditions.checkType(_.isFunction(isSameGroup));
  }

  var group = [];

  this.next = function () {
    while (true) {
      var item = sourceIterator.next();
      var fullGroup;

      if (Js.isNothing(item)) {
        if (group.length > 0) {
          fullGroup = group;
          group = [];
          return fullGroup;
        } else {
          return null;
        }
      }

      if (group.length < 1) {
        group.push(item);
        continue;
      }

      if (isSameGroup(group[0], item)) {
        group.push(item);
      } else {
        fullGroup = group;
        group = [item];
        return fullGroup;
      }
    }
  };
};
