# Iterator Utils

This is a library of javascript iterator utilities, for merging and aggregating sorted iterators.
This is a CommonJS package that is also compatible with all AMD loaders, like RequireJS, and it works with Node.JS
and also in a browser.

## Acknowledgements

See this great template for starting a project like this one: [browserify-grunt-mocha-template](https://github.com/basti1302/browserify-grunt-mocha-template),
and see this guy's blog post: [Cross Platform Javascript](https://blog.codecentric.de/en/2014/02/cross-platform-javascript/).
The one major difference between this build setup and the one in the template, is that this build includes bower dependencies, imported with the [debowerify](https://github.com/eugeneware/debowerify) transformer.
This build only runs in-browser tests, because mocha can't resolve the bower dependencies on its own, but browserify does bundle them into the browser tests.

### Primer

According to this library, an "iterator" is any object that has a ```next()``` function, like this one:

```javascript
var c = 0;
var myCounterIterator = {
  next: function () {
    return c++;
  }
};
```

There's no ```hasNext()``` function, so iterators indicate end-of-stream by returning null or undefined from the ```next()``` function. This iterator terminates after 10 iterations:

```javascript
var c = 0;
var myCounterIterator = {
  next: function () {
    return c < 10 ? c++ : null;
  }
};
```

Iterator Utils provides fluent syntax for transforming iterators, and you can wrap your custom iterator so that you can use this syntax:

```javascript
var iterators = require('iteratorutils');

iterators.asIterator(myCounterIterator).group(...).memoize().window(...).mergeSortedIterators([...]).toArray();
```

Or you can get a new iterator from an array:

```javascript
['a', 'b', 'c'].iterator().group(...).memoize().window(...).mergeSortedIterators([...]).toArray();
```

## Examples

You can import this package a la CommonJS, and use exported classes. ArrayIterator will iterate over an array, once.

```javascript
var iterators = require('iteratorutils');

var it = new iterators.ArrayIterator([1, 2]);

it.next(); // 1
it.next(); // 2
it.next(); // null
```

Or you can use syntactic sugar, but you still have to require the module.

```javascript
var iterators = require('iteratorutils');

var it = [1, 2].iterator();

it.next(); // 1
it.next(); // 2
it.next(); // null
```

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
var iterators = require('iteratorutils');

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

## License

MIT
