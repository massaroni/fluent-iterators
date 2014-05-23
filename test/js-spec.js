'use strict';

var Js = require('../lib/js');
var Preconditions = require('../lib/preconditions');

var chai = require('chai');
var expect = chai.expect;


describe('Js and Preconditions tests', function() {

  it('should replace 1 %s with 1 string argument', function() {
    expect(Js.formatString('a%s', 'b')).to.equal('ab');
  });

  it('should replace 2 %s with 2 string arguments', function() {
    expect(Js.formatString('a%s%s', 'b', 'c')).to.equal('abc');
  });

  it('replaces 1 of 2 %s with 1 string arguments', function () {
    expect(Js.formatString('a%s%s', 'b')).to.equal('ab%s');
  });

  it('replaces 1 %s with 1 number argument', function () {
    expect(Js.formatString('a%s', 123)).to.equal('a123');
  });

  it('replaces 1 %s with 1 number argument, and ignores the superfluous argument', function () {
    expect(Js.formatString('a%s', 123, 'extra arg')).to.equal('a123');
  });

  it('dosn\'t handle %s valued inputs', function () {
    expect(Js.formatString('a%s%s', '%s', 'x')).to.equal('ax%s');
  });

  it('strings containing just digits should be valid integers', function () {
    expect(Js.isInteger('123')).to.equal(true);
  });

  it('functions are functions', function () {
    expect(Js.isFunction(function () {
    })).to.equal(true);
  });

  it('numbers are not functions', function () {
    expect(Js.isFunction(123)).to.equal(false);
  });

  it('strings are not functions', function () {
    expect(Js.isFunction('s')).to.equal(false);
  });

  it('objects are not functions', function () {
    expect(Js.isFunction({})).to.equal(false);
  });

  it('arrays are not functions', function () {
    expect(Js.isFunction([])).to.equal(false);
  });

  it('Preconditions global should be defined', function () {
    expect(!!Preconditions).to.equal(true);
  });

  it('Preconditions.checkArgument global should be a function', function () {
    expect(Js.isFunction(Preconditions.checkArgument)).to.equal(true);
  });

  it('Preconditions.checkState global should be defined', function () {
    expect(Js.isFunction(Preconditions.checkState)).to.equal(true);
  });

  it('Function.prototype.bind should be defined', function () {
    expect(Js.isFunction(Function.prototype.bind)).to.equal(true);
  });

  it('should not throw an exception for true', function () {
    expect(Preconditions.checkArgument.bind(null, true, 'error message')).not.to.throw();
  });

  it('should not throw an exception for object', function () {
    expect(Preconditions.checkArgument.bind(null, {}, 'error message')).not.to.throw();
  });

  it('should not throw an exception for 0', function () {
    expect(Preconditions.checkArgument.bind(null, 0, 'error message')).not.to.throw();
  });

  it('should not throw an exception for -1', function () {
    expect(Preconditions.checkArgument.bind(null, -1, 'error message')).not.to.throw();
  });

  it('should throw an exception for undefined', function () {
    expect(Preconditions.checkArgument.bind(null, undefined, 'error message')).to.throw(Error);
  });

  it('should throw an exception for null', function () {
    expect(Preconditions.checkArgument.bind(null, null, 'error message')).to.throw(Error);
  });

  it('should throw an exception for false', function () {
    expect(Preconditions.checkArgument.bind(null, false, 'error message')).to.throw(Error);
  });

  it('integer numbers are obviously valid integers', function () {
    expect(Js.isInteger(123)).to.equal(true);
  });

  it('strings with mixed characters are not valid integers', function () {
    expect(Js.isInteger('123x')).to.equal(false);
  });

  it('strings with floats are not valid integers', function () {
    expect(Js.isInteger('123.2')).to.equal(false);
  });

  it('floats are not valid integers', function () {
    expect(Js.isInteger(123.2)).to.equal(false);
  });

  it('null is not a valid integer', function () {
    expect(Js.isInteger(null)).to.equal(false);
  });

  it('undefined is not a valid integer', function () {
    expect(Js.isInteger(undefined)).to.equal(false);
  });

  it('undefined is not a string', function () {
    expect(Js.isString(undefined)).to.equal(false);
  });

  it('null is not a string', function () {
    expect(Js.isString(null)).to.equal(false);
  });

  it('a number is not a string', function () {
    expect(Js.isString(123)).to.equal(false);
  });

  it('a string of digits is a string', function () {
    expect(Js.isString('123')).to.equal(true);
  });

  it('a string of digits is not an integer number', function () {
    expect(Js.isIntegerNumber('123')).to.equal(false);
  });

  it('a float is not an integer number', function () {
    expect(Js.isIntegerNumber(123.4)).to.equal(false);
  });

  it('an integer number is an integer number', function () {
    expect(Js.isIntegerNumber(123)).to.equal(true);
  });

  it('null is not an an integer number', function () {
    expect(Js.isIntegerNumber(null)).to.equal(false);
  });

  it('undefined is not an an integer number', function () {
    expect(Js.isIntegerNumber(undefined)).to.equal(false);
  });

  it('an object is not an an integer number', function () {
    expect(Js.isIntegerNumber({number: 123})).to.equal(false);
  });

  it('an empty array', function () {
    expect(Js.isArray([])).to.equal(true);
  });

  it('an array with something in it', function () {
    expect(Js.isArray([5, 'something'])).to.equal(true);
  });

  it('an empty map', function () {
    expect(Js.isArray({})).to.equal(false);
  });

  it('an integer', function () {
    expect(Js.isArray(2)).to.equal(false);
  });

  it('a string', function () {
    expect(Js.isArray('abc')).to.equal(false);
  });

  it('null is not an array', function () {
    expect(Js.isArray(null)).to.equal(false);
  });

  it('undefined is not an array', function () {
    expect(Js.isArray(undefined)).to.equal(false);
  });

  it('no arguments is not an array', function () {
    expect(Js.isArray()).to.equal(false);
  });

  it('an empty array is not an object', function () {
    expect(Js.isObject([])).to.equal(false);
  });

  it('a string is not an object', function () {
    expect(Js.isObject('foo')).to.equal(false);
  });

  it('a number is not an object', function () {
    expect(Js.isObject(123)).to.equal(false);
  });

  it('null is not an object', function () {
    expect(Js.isObject(null)).to.equal(false);
  });

  it('undefined is not an object', function () {
    expect(Js.isObject(undefined)).to.equal(false);
  });

  it('an object is an object', function () {
    expect(Js.isObject({x: 1})).to.equal(true);
  });

});