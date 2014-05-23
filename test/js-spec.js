'use strict';

var Js = require('../lib/js');

var chai = require('chai');
var expect = chai.expect;


describe('Js tests', function() {

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

});