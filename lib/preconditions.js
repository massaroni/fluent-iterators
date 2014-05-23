'use strict';

var Js = require('./js');

var Preconditions = {};

module.exports = Preconditions;

/**
 * Throw an error if a condition evaluates to false, like in Guava.
 * The first argument is the condition. The second argument is the error message. All other arguments are used in formatting the error message argument.
 * The error message can be templated, according to Js.formatString(), so this function takes any number of trailing arguments.
 *
 * usage: Preconditions.checkArgument(x === y, 'Bad argument %s x should be y.', 'because')
 */
var check = function (isGood, checkTypeMsg, errorMsg, errorMsgArgs) {
  if (!!isGood || isGood === 0) {
    return;
  }

  if (!errorMsg) {
    throw new Error(checkTypeMsg);
  }

  if (!Js.isString(errorMsg)) {
    console.error('Expected a string as the second argument, but was ' + errorMsg);
    return;
  }

  if (!checkTypeMsg) {
    checkTypeMsg = 'Error: ';
  }

  var formattedErrorMsg = Js.formatString.apply(null, errorMsgArgs);
  throw new Error(checkTypeMsg + formattedErrorMsg);
};

Preconditions.checkArgument = function (isGood, errorMsg) {
  var args = Array.prototype.slice.call(arguments);
  var errorMsgArgs = args.slice(1, args.length);

  check(isGood, 'Illegal Argument: ', errorMsg, errorMsgArgs);
};

Preconditions.checkState = function (isGood, errorMsg) {
  var args = Array.prototype.slice.call(arguments);
  var errorMsgArgs = args.slice(1, args.length);

  check(isGood, 'Illegal State: ', errorMsg, errorMsgArgs);
};
