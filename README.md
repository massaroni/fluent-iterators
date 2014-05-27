# Fluent Iterators

This is a Guava-esque library of javascript iterators for transforming, memoizing, grouping, sorted-merging, sliding-window-reducing, and doing more stuff to your iterables.
This is a CommonJS package compatible with all AMD loaders, like RequireJS, available via Bower, and soon NPM, and it works in a browser or in Node.JS.

## Installation

### Bower

Add this line to your bower.json file:

```json
 "dependencies": {
 ...
  "fluent-iterators": "~0.0.1"
 ...
 }
```


## Examples

This library provides all these fluent functions for building transformative iterators. You can chain together a pipeline of iterators that transform a stream of objects as they're pulled through.

```javascript
['a', 'b', 'c'].iterator().transform(...).group(...).limit(...).filter(...)
  .memoize().window(...).mergeSortedIterators([...]).aggregate(...).toArray();
```

In this framework, an "iterator" is any object with a ```next()``` function, like this one.

```javascript
var c = 0;
var myCounterIterator = {
  next: function () {
    return c++;
  }
};
```


There's no ```hasNext()``` function, so iterators indicate end-of-stream by returning ```null``` or ```undefined``` from the ```next()``` function. For example, this iterator terminates after 10 iterations.

```javascript
var c = 0;
var myCounterIterator = {
  next: function () {
    return c < 10 ? c++ : null;
  }
};
```


You can import this package via CommonJS, and either instantiate exported classes, or use the fluent syntax. You will need to wrap your hand made iterator objects to use the fluent syntax with them, using the ```asIterator(iterator)``` utility function available in the CommonJS module exports, or on the FluentIterators global variable, in the standalone bundle.

```javascript
// in CommonJS
var iterators = require('fluent-iterators');

iterators.asIterator(myCounterIterator).group(...)
  .memoize().window(...).mergeSortedIterators([...]).toArray();
```

```javascript
// in standalone mode, with the FluentIterators global variable.
FluentIterators.asIterator(myCounterIterator).group(...)
  .memoize().window(...).mergeSortedIterators([...]).toArray();
```


You can get a new iterator from an array, with fluent syntax.

```javascript
var iterators = require('fluent-iterators');

var it = [1, 2].iterator();

it.next(); // 1
it.next(); // 2
it.next(); // null
```


Or by instantiating the exported class.

```javascript
var iterators = require('fluent-iterators');

var it = new iterators.ArrayIterator([1, 2]);

it.next(); // 1
it.next(); // 2
it.next(); // null
```


### Merge Sorted Iterators

You can merge sorted iterators into a single, sorted iterator.
By default, it will use the items' natural ascending order.
If your input iterators are out of order, then the merged iterator will also return items out of order.

```javascript
var s1 = [1, 5, 5, 100, 101].iterator();
var s2 = [0, 10, 20, 30, 40].iterator();
var s3 = [9, 10, 11].iterator();

var merged = s1.mergeSortedIterators([s2, s3]);

merged.next(); // 0
merged.next(); // 1
merged.next(); // 5
merged.next(); // 5
merged.next(); // 9
merged.next(); // 10
merged.next(); // 10
merged.next(); // 11
merged.next(); // 20
merged.next(); // 30
merged.next(); // 40
merged.next(); // 100
merged.next(); // 101
merged.next(); // null
```


Or you can provide your own comparator.

```javascript
var s1 = [{x:1}, {x:5}, {x:5}, {x:100}, {x:101}].iterator();
var s2 = [{x:0}, {x:10}, {x:20}, {x:30}, {x:40}].iterator();
var s3 = [{x:9}, {x:10}, {x:11}].iterator();

var asc = function (lhs, rhs) {
  return lhs.x - rhs.x;
};

var merged = s1.mergeSortedIterators([s2, s3], asc);

merged.next(); // {x:0}
merged.next(); // {x:1}
merged.next(); // {x:5}
merged.next(); // {x:5}
merged.next(); // {x:9}
merged.next(); // {x:10}
merged.next(); // {x:10}
merged.next(); // {x:11}
merged.next(); // {x:20}
merged.next(); // {x:30}
merged.next(); // {x:40}
merged.next(); // {x:100}
merged.next(); // {x:101}
merged.next(); // null
```


Or you can use the ```new``` keyword, with the exported class.

```javascript
var iterators = require('fluent-iterators');

var s1 = [{x:1}, {x:5}, {x:5}, {x:100}, {x:101}].iterator();
var s2 = [{x:0}, {x:10}, {x:20}, {x:30}, {x:40}].iterator();
var s3 = [{x:9}, {x:10}, {x:11}].iterator();

var asc = function (lhs, rhs) {
  return lhs.x - rhs.x;
};

var merged = new iterators.SortedIteratorMerger([s1, s2, s3], asc);

merged.next(); // {x:0}
merged.next(); // {x:1}
...
```


### Grouping

You can group together consecutive items from a source iterator.

By default, ```group()``` uses strict equality.

```javascript
    var source = [5, 2, 2, 4, 4, 4, 1, 7, 2, 2].iterator();
    var grouped = new Iterators.GroupingIterator(source);

    grouped.next(); // [5]
    grouped.next(); // [2, 2] (it captures contiguous groups)
    grouped.next(); // [4, 4, 4] (it can capture any length group)
    grouped.next(); // [1]
    grouped.next(); // [7] (it won't group consecutive individuals)
    grouped.next(); // [2, 2] (it doesn't matter that we already had a group of 2's)
    grouped.next(); // null  (it emits a null end-of-stream token)
```


Or you can supply your own grouping function:

```javascript
var source = [{a:5, b:1}, {a:2, b:1}, {a:2, b:1}].iterator();
var grouped = source.group(function (lhs, rhs) {
  return lhs.a === rhs.a; // this function doesn't need to handle null end-of-stream tokens
});

grouped.next(); // [{a:5, b:1}]
grouped.next(); // [{a:2, b:1}, {a:2, b:1}]
grouped.next(); // null
```


### Limit

Terminate an iterator after a max number of iterations.

```javascript
var limited = ['a', 'b', 'c'].iterator().limit(2);

limited.next(); // 'a'
limited.next(); // 'b'
limited.next(); // null
```


### Filter

Filter items out of a source iterator.

```javscript
var isGreaterThanTen = function (n) {
  return n > 10;
};

var filtered = [1, 11, 2, 12].iterator().filter(isGreaterThanTen);

filtered.next(); // 11
filtered.next(); // 12
filtered.next(); // null
```


### toArray()

Drain an iterator into an array.

```javscript
var gtTen = function (n) {
  return n > 10;
};

[1, 11, 2, 12].iterator().filter(gtTen).toArray(); // [11, 12]
```


### Transform

You can transform items from a source iterator.

```javascript
var prependA = function (n) {
  return 'a' + n.toString();
};

var transformed = [1, 11, 2].iterator().transform(prependA);

transformed.next(); // 'a1'
transformed.next(); // 'a11'
transformed.next(); // 'a2'
transformed.next(); // null
```


### Sliding-Window Reducer

You can use a reducer callback function, as per the native ```Array.reduce()``` api.
You can use this even if the browser doesn't provide a native ```Array.reduce()``` function.
This does a reduce() scan over the whole window, in each iteration, so this provides O(n * windowSize) time cost.

```javascript
var source = [8,9,0,5].iterator();

var sumReducer = function(previousValue, currentValue, index, array){
  return previousValue + currentValue;
};

var windowSize = 2;
var reduced = source.window(windowSize, sumReducer);

reduced.next(); // 8
reduced.next(); // 17
reduced.next(); // 9
reduced.next(); // 5
reduced.next(); // null
```


Or you can use an accumulator object, with ```add(item)```, ```remove(item)```, and ```reduce()``` functions.
The window iterator calls add, remove, and reduce, once for each iteration, so you can get O(n) time cost if each of those functions has a O(1) time cost.
This example does the sliding window summation in O(n) time.

```javascript
var source = [8,9,0,5].iterator();

var sum = 0;
var sumAccumulator = {
  add : function (item) {
    sum += item;
  },
  remove : function (item) {
    sum -= item;
  },
  reduce : function () {
    return sum;
  }
};

var reduced = source.window(2, sumAccumulator);

reduced.next(); // 8
reduced.next(); // 17
reduced.next(); // 9
reduced.next(); // 5
reduced.next(); // null
```

### Aggregate

You can aggregate contiguous duplicate items from an iterator. It uses an equality function to decide
whether to reduce the next item.  The equality function has to handle null inputs,
because ```lhs``` is always ```null``` in the first iteration.
Note: This api serves a very specific use case, and I'm working on a better ```reduce()``` function that doesn't depend
on a concept of item equality.

```javascript
    var stream = [{x:1}, {x:5}, {x:5}, {x:2}].iterator().aggregate(
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


summed.next().x; // 2
summed.next().x; // 10
summed.next().x; // 2
summed.next().x; // 33
summed.next(); // null
```

## Acknowledgements

See this great template for starting a project like this one: [browserify-grunt-mocha-template](https://github.com/basti1302/browserify-grunt-mocha-template),
and see the blog post that goes with it: [Cross Platform Javascript](https://blog.codecentric.de/en/2014/02/cross-platform-javascript/).

## License

MIT
