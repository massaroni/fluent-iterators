'use strict';

var Iterators = require('../iteratorutils');

var chai = require('chai');
var expect = chai.expect;


describe('Iterator Utils', function () {
  it('should provide fluent generation of an array backed iterator with the .iterator() sugar function', function () {
    var stream = [1, 5, 5].iterator();

    expect(stream.next()).to.equal(1);
    expect(stream.next()).to.equal(5);
    expect(stream.next()).to.equal(5);
    expect(stream.next()).to.equal(null);
    expect(stream.next()).to.equal(null);
  });

  it('should aggregate an iterator with the items strict equality, by default.', function () {
    var stream = [1, 5, 5, 2].iterator().aggregate(
      function (lhs, rhs) {
        return lhs + rhs;
      }
    );

    expect(stream.next()).to.equal(1);
    expect(stream.next()).to.equal(10);
    expect(stream.next()).to.equal(2);
    expect(stream.next()).to.equal(null);
    expect(stream.next()).to.equal(null);
  });

  it('should reject a non-array argument to the ArrayIterator ctor.', function () {
    var tripsPrecondition = function () {
      return new Iterators.ArrayIterator(1234);
    };

    expect(tripsPrecondition).to.throw(TypeError);
  });

  it('should aggregate duplicate items based on an equality function paramter.', function () {
    var stream = [
      {x: 1},
      {x: 5},
      {x: 5},
      {x: 2}
    ].iterator().aggregate(
      function (lhs, rhs) {
        return {x: lhs.x + rhs.x };
      }, function (lhs, rhs) {
        if (!lhs) {
          return !rhs;
        }
        if (!rhs) {
          return false;
        }
        return lhs.x === rhs.x;
      }
    );

    expect(stream.next().x).to.equal(1);
    expect(stream.next().x).to.equal(10);
    expect(stream.next().x).to.equal(2);
    expect(stream.next()).to.equal(null);
    expect(stream.next()).to.equal(null);
  });

  it('should merge sorted iterators, with the default ascending natural order.', function () {
    var s1 = [1, 5, 5, 100, 101].iterator();
    var s2 = [0, 10, 20, 30, 40].iterator();
    var s3 = [9, 10, 11].iterator();

    var merged = s1.mergeSortedIterators([s2, s3]);

    expect(merged.next()).to.equal(0);
    expect(merged.next()).to.equal(1);
    expect(merged.next()).to.equal(5);
    expect(merged.next()).to.equal(5);
    expect(merged.next()).to.equal(9);
    expect(merged.next()).to.equal(10);
    expect(merged.next()).to.equal(10);
    expect(merged.next()).to.equal(11);
    expect(merged.next()).to.equal(20);
    expect(merged.next()).to.equal(30);
    expect(merged.next()).to.equal(40);
    expect(merged.next()).to.equal(100);
    expect(merged.next()).to.equal(101);
    expect(merged.next()).to.equal(null);
    expect(merged.next()).to.equal(null);
  });

  it('should merge sorted iterators, with the provided ascending order comparator.', function () {
    var s1 = [1, 5, 5, 100, 101].iterator();
    var s2 = [0, 10, 20, 30, 40].iterator();
    var s3 = [9, 10, 11].iterator();

    var asc = function (lhs, rhs) {
      return lhs - rhs;
    };

    var merged = s1.mergeSortedIterators([s2, s3], asc);

    expect(merged.next()).to.equal(0);
    expect(merged.next()).to.equal(1);
    expect(merged.next()).to.equal(5);
    expect(merged.next()).to.equal(5);
    expect(merged.next()).to.equal(9);
    expect(merged.next()).to.equal(10);
    expect(merged.next()).to.equal(10);
    expect(merged.next()).to.equal(11);
    expect(merged.next()).to.equal(20);
    expect(merged.next()).to.equal(30);
    expect(merged.next()).to.equal(40);
    expect(merged.next()).to.equal(100);
    expect(merged.next()).to.equal(101);
    expect(merged.next()).to.equal(null);
    expect(merged.next()).to.equal(null);
  });

  it('should memoize a stream so that you can replay through historical items without calling the source iterator.', function () {
    var callCount = 0;
    var source = {
      next: function () {
        return callCount++;
      }
    };

    var memoized = new Iterators.MemoizedIterator(source);

    expect(memoized.next()).to.equal(0);
    expect(memoized.next()).to.equal(1);
    expect(memoized.next()).to.equal(2);

    var replayer = memoized.replay();

    expect(replayer.next()).to.equal(0);
    expect(replayer.next()).to.equal(1);
    expect(replayer.next()).to.equal(2);
    expect(replayer.next()).to.equal(3);

    expect(memoized.next()).to.equal(3);
    expect(memoized.next()).to.equal(4);
  });

  it('should provide memoize and replay support for array iterators, or any other kind of iterator', function () {
    var memoized = ['a', 'b', 'x', 'y', 'z'].iterator().memoize();
    var replayer = memoized.replay();

    expect(memoized.next()).to.equal('a');
    expect(memoized.next()).to.equal('b');

    expect(replayer.next()).to.equal('a');
    expect(replayer.next()).to.equal('b');
    expect(replayer.next()).to.equal('x');

    expect(memoized.next()).to.equal('x');
    expect(memoized.next()).to.equal('y');
    expect(memoized.next()).to.equal('z');

    expect(memoized.next()).to.equal(null);
    expect(memoized.next()).to.equal(null);

    expect(replayer.next()).to.equal('y');
    expect(replayer.next()).to.equal('z');
    expect(replayer.next()).to.equal(null);
    expect(replayer.next()).to.equal(null);
    expect(replayer.next()).to.equal(null);
  });

  it('should group consecutive equal numbers from a source array, using their strict equality, by default.', function () {
    var source = [5, 2, 2, 4, 4, 4, 1, 7, 2, 2].iterator();
    var grouped = new Iterators.GroupingIterator(source);

    expect(Object.equal(grouped.next(), [5])).to.be.true;
    expect(Object.equal(grouped.next(), [2, 2])).to.be.true; // it can capture contiguous groups
    expect(Object.equal(grouped.next(), [4, 4, 4])).to.be.true; // it can capture any length group
    expect(Object.equal(grouped.next(), [1])).to.be.true;
    expect(Object.equal(grouped.next(), [7])).to.be.true; // it won't group consecutive individuals
    expect(Object.equal(grouped.next(), [2, 2])).to.be.true; // it can re-capture groups of values it's already captured
    expect(grouped.next()).to.equal(null); // it emits a null end-of-stream token
  });

  it('should group consecutive equal objects using a callback function.', function () {
    var source = [{a:5, b:1}, {a:2, b:1}, {a:2, b:1}].iterator();
    var grouped = new Iterators.GroupingIterator(source, function (lhs, rhs) {
      return lhs.a === rhs.a; // this function doesn't need to handle null end-of-stream tokens
    });

    expect(Object.equal(grouped.next(), [{a:5, b:1}])).to.be.true;
    expect(Object.equal(grouped.next(), [{a:2, b:1}, {a:2, b:1}])).to.be.true;
    expect(grouped.next()).to.equal(null);
  });

  it('should provide a fluent group() function on all iterators.', function () {
    var source = [{a:5, b:1}, {a:2, b:1}, {a:2, b:1}].iterator();
    var grouped = source.group(function (lhs, rhs) {
      return lhs.a === rhs.a; // this function doesn't need to handle null end-of-stream tokens
    });

    expect(Object.equal(grouped.next(), [{a:5, b:1}])).to.be.true;
    expect(Object.equal(grouped.next(), [{a:2, b:1}, {a:2, b:1}])).to.be.true;
    expect(grouped.next()).to.equal(null);
  });

});