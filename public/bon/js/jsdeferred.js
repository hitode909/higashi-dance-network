/**
 * @fileOverview JSDeferred
 * @author       cho45@lowreal.net
 * @version      0.4.0
 * @license
 * JSDeferred Copyright (c) 2007 cho45 ( www.lowreal.net )
 *
 * http://github.com/cho45/jsdeferred
 *
 * License:: MIT
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
/*
 * doc comment
 * http://code.google.com/intl/ja/closure/compiler/docs/js-for-compiler.html
 */

/**
 * Create a Deferred object
 *
 * @example
 *   var d = new TheDeferred();
 *   // or this is shothand of above.
 *   var d = TheDeferred();
 *
 * @example
 *   $.deferred.define();
 *
 *   $.get("/hoge").next(function (data) {
 *       alert(data);
 *   }).
 *
 *   parallel([$.get("foo.html"), $.get("bar.html")]).next(function (values) {
 *       log($.map(values, function (v) { return v.length }));
 *       if (values[1].match(/nextUrl:\s*(\S+)/)) {
 *           return $.get(RegExp.$1).next(function (d) {
 *               return d;
 *           });
 *       }
 *   }).
 *   next(function (d) {
 *       log(d.length);
 *   });
 *
 * @constructor
 */
function TheDeferred () { return (this instanceof TheDeferred) ? this.init() : new TheDeferred() }
/** 
 * default callback function
 * @type {function(this:TheDeferred, ...[*]):*} 
 * @field
 */
TheDeferred.ok = function (x) { return x };
/** 
 * default errorback function
 * @type {function(this:TheDeferred, ...[*]):*} 
 * @field
 */
TheDeferred.ng = function (x) { throw  x };
TheDeferred.prototype = {
	/**
	 * This is class magic-number of TheDeferred for determining identity of two instances
	 * that are from different origins (eg. Mozilla Add-on) instead of using "instanceof".
	 *
	 * @const
	 */
	_id : 0xe38286e381ae,

	/**
	 * @private
	 * @return {TheDeferred} this
	 */
	init : function () {
		this._next    = null;
		this.callback = {
			ok: TheDeferred.ok,
			ng: TheDeferred.ng
		};
		return this;
	},

	/**
	 * Create new TheDeferred and sets `fun` as its callback.
	 *
	 * @example
	 *   var d = new TheDeferred();
	 *
	 *   d.
	 *   next(function () {
	 *     alert(1);
	 *   }).
	 *   next(function () {
	 *     alert(2);
	 *   });
	 *
	 *   d.call();
	 *
	 * @param {function(this:TheDeferred, ...[*]):*} fun Callback of continuation.
	 * @return {TheDeferred} next deferred
	 */
	next  : function (fun) { return this._post("ok", fun) },

	/**
	 * Create new TheDeferred and sets `fun` as its errorback.
	 * 
	 * If `fun` not throws error but returns normal value, TheDeferred treats
	 * the given error is recovery and continue callback chain.
	 *
	 * @example
	 *   var d =  new TheDeferred();
	 *
	 *   d.
	 *   next(function () {
	 *     alert(1);
	 *     throw "foo";
	 *   }).
	 *   next(function () {
	 *     alert('not shown');
	 *   }).
	 *   error(function (e) {
	 *     alert(e); //=> "foo"
	 *   });
	 *
	 *   d.call();
	 *
	 * @param {function(this:TheDeferred, ...[*]):*} fun Errorback of continuation.
	 * @return {TheDeferred} next deferred
	 */
	error : function (fun) { return this._post("ng", fun) },

	/**
	 * Invokes self callback chain.
	 *
	 * @example
	 *   function timeout100 () {
	 *     var d = new TheDeferred();
	 *     setTimeout(function () {
	 *        d.call('value');
	 *     }, 100);
	 *     return d;
	 *   }
	 *
	 * @param {*} val Value passed to continuation.
	 * @return {TheDeferred} this
	 */
	call  : function (val) { return this._fire("ok", val) },

	/**
	 * Invokes self errorback chain. You can use this method for explicit errors (eg. HTTP request failed)
	 * 
	 * @example
	 *   function http (url) {
	 *     var d = new TheDeferred();
	 *     var x = new XMLHttpRequest();
	 *     x.onreadystatechange = function () {
	 *       if (x.readyState == 4) {
	 *         if (x.status == 200) d.call(x); else d.fail(x);
	 *       }
	 *     };
	 *     return d;
	 *   }
	 *
	 * @param {*} val Value of error.
	 * @return {TheDeferred} this
	 */
	fail  : function (err) { return this._fire("ng", err) },

	/**
	 * Cancel receiver callback (this is only valid before invoking any callbacks)
	 *
	 * @return {TheDeferred} this
	 */
	cancel : function () {
		(this.canceller || function () {})();
		return this.init();
	},

	_post : function (okng, fun) {
		this._next =  new TheDeferred();
		this._next.callback[okng] = fun;
		return this._next;
	},

	_fire : function (okng, value) {
		var next = "ok";
		try {
			value = this.callback[okng].call(this, value);
		} catch (e) {
			next  = "ng";
			value = e;
			if (TheDeferred.onerror) TheDeferred.onerror(e);
		}
		if (TheDeferred.isTheDeferred(value)) {
			value._next = this._next;
		} else {
			if (this._next) this._next._fire(next, value);
		}
		return this;
	}
};
/**
 * Returns true if an argument is TheDeferred.
 *
 * @function
 * @param {*} obj object to determine.
 * @return {boolean}
 */
TheDeferred.isTheDeferred = function (obj) {
	return !!(obj && obj._id == TheDeferred.prototype._id);
};

/**
 * `next` is shorthand for creating new deferred which
 * is called after current queue.
 *
 * @function
 * @name TheDeferred.next
 * @param {function():*} fun callback
 * @return {TheDeferred}
 */
TheDeferred.next_default = function (fun) {
	var d = new TheDeferred();
	var id = setTimeout(function () { d.call() }, 0);
	d.canceller = function () { clearTimeout(id) };
	if (fun) d.callback.ok = fun;
	return d;
};
TheDeferred.next_faster_way_readystatechange = ((typeof window === 'object') && (location.protocol == "http:") && !window.opera && /\bMSIE\b/.test(navigator.userAgent)) && function (fun) {
	// MSIE
	var d = new TheDeferred();
	var t = new Date().getTime();
	if (t - arguments.callee._prev_timeout_called < 150) {
		var cancel = false;
		var script = document.createElement("script");
		script.type = "text/javascript";
		script.src  = "data:text/javascript,";
		script.onreadystatechange = function () {
			if (!cancel) {
				d.canceller();
				d.call();
			}
		};
		d.canceller = function () {
			if (!cancel) {
				cancel = true;
				script.onreadystatechange = null;
				document.body.removeChild(script);
			}
		};
		document.body.appendChild(script);
	} else {
		arguments.callee._prev_timeout_called = t;
		var id = setTimeout(function () { d.call() }, 0);
		d.canceller = function () { clearTimeout(id) };
	}
	if (fun) d.callback.ok = fun;
	return d;
};
TheDeferred.next_faster_way_Image = ((typeof window === 'object') && (typeof(Image) != "undefined") && !window.opera && document.addEventListener) && function (fun) {
	// Modern Browsers
	var d = new TheDeferred();
	var img = new Image();
	var handler = function () {
		d.canceller();
		d.call();
	};
	img.addEventListener("load", handler, false);
	img.addEventListener("error", handler, false);
	d.canceller = function () {
		img.removeEventListener("load", handler, false);
		img.removeEventListener("error", handler, false);
	};
	img.src = "data:image/png," + Math.random();
	if (fun) d.callback.ok = fun;
	return d;
};
TheDeferred.next_tick = (typeof process === 'object' && typeof process.nextTick === 'function') && function (fun) {
	var d = new TheDeferred();
	process.nextTick(function() { d.call() });
	if (fun) d.callback.ok = fun;
	return d;
};
TheDeferred.next = TheDeferred.next_faster_way_readystatechange ||
                TheDeferred.next_faster_way_Image ||
                TheDeferred.next_tick ||
                TheDeferred.next_default;

/**
 * Construct TheDeferred chain with array and return its TheDeferred.
 * This is shorthand for construct TheDeferred chains.
 *
 * @example
 *  return chain(
 *      function () {
 *          return wait(0.5);
 *      },
 *      function (w) {
 *          throw "foo";
 *      },
 *      function error (e) {
 *          alert(e);
 *      },
 *      [
 *          function () {
 *              return wait(1);
 *          },
 *          function () {
 *              return wait(2);
 *          }
 *      ],
 *      function (result) {
 *          alert([ result[0], result[1] ]);
 *      },
 *      {
 *          foo: wait(1),
 *          bar: wait(1)
 *      },
 *      function (result) {
 *          alert([ result.foo, result.bar ]);
 *      },
 *      function error (e) {
 *          alert(e);
 *      }
 *  );
 *
 * @param {...[(Array.<function(*):*>|Object.<string,function(*):*>|function(*):*)]} arguments process chains
 * @return {TheDeferred}
 */
TheDeferred.chain = function () {
	var chain = TheDeferred.next();
	for (var i = 0, len = arguments.length; i < len; i++) (function (obj) {
		switch (typeof obj) {
			case "function":
				var name = null;
				try {
					name = obj.toString().match(/^\s*function\s+([^\s()]+)/)[1];
				} catch (e) { }
				if (name != "error") {
					chain = chain.next(obj);
				} else {
					chain = chain.error(obj);
				}
				break;
			case "object":
				chain = chain.next(function() { return TheDeferred.parallel(obj) });
				break;
			default:
				throw "unknown type in process chains";
		}
	})(arguments[i]);
	return chain;
};

/**
 * `wait` returns deferred that will be called after `sec` elapsed
 * with real elapsed time (msec)
 *
 * @example
 *   wait(1).next(function (elapsed) {
 *       log(elapsed); //=> may be 990-1100
 *   });
 *
 * @param {number} sec second to wait
 * @return {TheDeferred}
 */
TheDeferred.wait = function (n) {
	var d = new TheDeferred(), t = new Date();
	var id = setTimeout(function () {
		d.call((new Date).getTime() - t.getTime());
	}, n * 1000);
	d.canceller = function () { clearTimeout(id) };
	return d;
};

/**
 * `call` function is for calling function asynchronous.
 *
 * @example
 *   // like tail recursion
 *   next(function () {
 *       function pow (x, n) {
 *           function _pow (n, r) {
 *               print([n, r]);
 *               if (n == 0) return r;
 *               return call(_pow, n - 1, x * r);
 *           }
 *           return call(_pow, n, 1);
 *       }
 *       return call(pow, 2, 10);
 *   }).
 *   next(function (r) {
 *       print([r, "end"]);
 *   });
 *
 * @param {function(...[*]):*} fun function to call
 * @param {...*} args arguments passed to fun
 * @return {TheDeferred}
 */
TheDeferred.call = function (fun) {
	var args = Array.prototype.slice.call(arguments, 1);
	return TheDeferred.next(function () {
		return fun.apply(this, args);
	});
};

/**
 * `parallel` wraps up `deferredlist` to one deferred.
 * This is useful when some asynchronous resources are required.
 *
 * `deferredlist` can be Array or Object (Hash). If you specify
 * multiple objects as arguments, then they are wrapped into
 * an Array.
 *
 * @example
 *   parallel([
 *       $.get("foo.html"),
 *       $.get("bar.html")
 *   ]).next(function (values) {
 *       values[0] //=> foo.html data
 *       values[1] //=> bar.html data
 *   });
 *
 *   parallel({
 *       foo: $.get("foo.html"),
 *       bar: $.get("bar.html")
 *   }).next(function (values) {
 *       values.foo //=> foo.html data
 *       values.bar //=> bar.html data
 *   });
 *
 * @param {(Array.<TheDeferred>|Object.<string,TheDeferred>)} dl TheDeferreds wanted to wait
 * @return {TheDeferred}
 * @see TheDeferred.earlier
 */
TheDeferred.parallel = function (dl) {
	if (arguments.length > 1) dl = Array.prototype.slice.call(arguments);
	var ret = new TheDeferred(), values = {}, num = 0;
	for (var i in dl) if (dl.hasOwnProperty(i)) (function (d, i) {
		if (typeof d == "function") d = TheDeferred.next(d);
		d.next(function (v) {
			values[i] = v;
			if (--num <= 0) {
				if (dl instanceof Array) {
					values.length = dl.length;
					values = Array.prototype.slice.call(values, 0);
				}
				ret.call(values);
			}
		}).error(function (e) {
			ret.fail(e);
		});
		num++;
	})(dl[i], i);

	if (!num) TheDeferred.next(function () { ret.call() });
	ret.canceller = function () {
		for (var i in dl) if (dl.hasOwnProperty(i)) {
			dl[i].cancel();
		}
	};
	return ret;
};

/**
 * Continue process when one deferred in `deferredlist` has completed. Others will be canceled.
 * parallel ('and' processing) <=> earlier ('or' processing)
 *
 * @param {(Array.<TheDeferred>|Object.<string,TheDeferred>)} dl TheDeferreds wanted to wait
 * @return {TheDeferred}
 * @see TheDeferred.parallel
 */
TheDeferred.earlier = function (dl) {
	if (arguments.length > 1) dl = Array.prototype.slice.call(arguments);
	var ret = new TheDeferred(), values = {}, num = 0;
	for (var i in dl) if (dl.hasOwnProperty(i)) (function (d, i) {
		d.next(function (v) {
			values[i] = v;
			if (dl instanceof Array) {
				values.length = dl.length;
				values = Array.prototype.slice.call(values, 0);
			}
			ret.canceller();
			ret.call(values);
		}).error(function (e) {
			ret.fail(e);
		});
		num++;
	})(dl[i], i);

	if (!num) TheDeferred.next(function () { ret.call() });
	ret.canceller = function () {
		for (var i in dl) if (dl.hasOwnProperty(i)) {
			dl[i].cancel();
		}
	};
	return ret;
};


/**
 * `loop` function provides browser-non-blocking loop.
 * This loop is slow but not stop browser's appearance.
 * This function waits a deferred returned by loop function.
 *
 * @example
 *   //=> loop 1 to 100
 *   loop({begin:1, end:100, step:10}, function (n, o) {
 *       for (var i = 0; i < o.step; i++) {
 *           log(n+i);
 *       }
 *   });
 *
 * @example
 *   //=> loop 10 times with sleeping 1 sec in each loop.
 *   loop(10, function (n) {
 *       log(n);
 *       return wait(1);
 *   });
 *
 * @param {(number|{begin:number, end:number, step:number})} n loop definition
 * @param {function(number):*} fun loop function
 * @return {TheDeferred}
 */
TheDeferred.loop = function (n, fun) {
	var o = {
		begin : n.begin || 0,
		end   : (typeof n.end == "number") ? n.end : n - 1,
		step  : n.step  || 1,
		last  : false,
		prev  : null
	};
	var ret, step = o.step;
	return TheDeferred.next(function () {
		function _loop (i) {
			if (i <= o.end) {
				if ((i + step) > o.end) {
					o.last = true;
					o.step = o.end - i + 1;
				}
				o.prev = ret;
				ret = fun.call(this, i, o);
				if (TheDeferred.isTheDeferred(ret)) {
					return ret.next(function (r) {
						ret = r;
						return TheDeferred.call(_loop, i + step);
					});
				} else {
					return TheDeferred.call(_loop, i + step);
				}
			} else {
				return ret;
			}
		}
		return (o.begin <= o.end) ? TheDeferred.call(_loop, o.begin) : null;
	});
};


/**
 * Loop `n` times with `fun`.
 * This function automatically returns UI-control to browser, if the loop spends over 20msec.
 * This is useful for huge loop not to block browser UI.
 * This function can't wait a deferred returned by loop function, compared with TheDeferred.loop.
 *
 * @example
 *   repeat(10, function (i) {
 *       i //=> 0,1,2,3,4,5,6,7,8,9
 *   });
 *
 * @param {number} n loop count
 * @param {function(number)} fun loop function
 * @return {TheDeferred}
 */
TheDeferred.repeat = function (n, fun) {
	var i = 0, end = {}, ret = null;
	return TheDeferred.next(function () {
		var t = (new Date()).getTime();
		do {
			if (i >= n) return null;
			ret = fun(i++);
		} while ((new Date()).getTime() - t < 20);
		return TheDeferred.call(arguments.callee);
	});
};

/**
 * Register `fun` to TheDeferred prototype for method chain.
 *
 * @example
 *   // TheDeferred.register("loop", loop);
 *
 *   // Global TheDeferred function
 *   loop(10, function (n) {
 *       print(n);
 *   }).
 *   // Registered TheDeferred.prototype.loop
 *   loop(10, function (n) {
 *       print(n);
 *   });
 *
 * @param {string} name name of method
 * @param {function(*):TheDeferred} fun actual function of method
 */
TheDeferred.register = function (name, fun) {
	this.prototype[name] = function () {
		var a = arguments;
		return this.next(function () {
			return fun.apply(this, a);
		});
	};
};

TheDeferred.register("loop", TheDeferred.loop);
TheDeferred.register("wait", TheDeferred.wait);

/**
 * Connect a function with TheDeferred.  That is, transform a function
 * that takes a callback into one that returns a TheDeferred object.
 *
 * @example
 *   var timeout = TheDeferred.connect(setTimeout, { target: window, ok: 0 });
 *   timeout(1).next(function () {
 *       alert('after 1 sec');
 *   });
 *
 *   var timeout = TheDeferred.connect(window, "setTimeout");
 *   timeout(1).next(function () {
 *       alert('after 1 sec');
 *   });
 *
 * @param {(function(...[*]):*|*)} funo target function or object
 * @param {({ok:number, ng:number, target:*}|string)} options options or method name of object in arguments[0]
 * @return {function(...[*]):TheDeferred}
 */
TheDeferred.connect = function (funo, options) {
	var target, func, obj;
	if (typeof arguments[1] == "string") {
		target = arguments[0];
		func   = target[arguments[1]];
		obj    = arguments[2] || {};
	} else {
		func   = arguments[0];
		obj    = arguments[1] || {};
		target = obj.target;
	}

	var partialArgs       = obj.args ? Array.prototype.slice.call(obj.args, 0) : [];
	var callbackArgIndex  = isFinite(obj.ok) ? obj.ok : obj.args ? obj.args.length : undefined;
	var errorbackArgIndex = obj.ng;

	return function () {
		var d = new TheDeferred().next(function (args) {
			var next = this._next.callback.ok;
			this._next.callback.ok = function () {
				return next.apply(this, args.args);
			};
		});

		var args = partialArgs.concat(Array.prototype.slice.call(arguments, 0));
		if (!(isFinite(callbackArgIndex) && callbackArgIndex !== null)) {
			callbackArgIndex = args.length;
		}
		var callback = function () { d.call(new TheDeferred.Arguments(arguments)) };
		args.splice(callbackArgIndex, 0, callback);
		if (isFinite(errorbackArgIndex) && errorbackArgIndex !== null) {
			var errorback = function () { d.fail(arguments) };
			args.splice(errorbackArgIndex, 0, errorback);
		}
		TheDeferred.next(function () { func.apply(target, args) });
		return d;
	}
};
/**
 * Used for TheDeferred.connect to allow to pass multiple values to next.
 *
 * @private
 * @constructor
 * @param {Array.<*>} args
 * @see TheDeferred.connect
 */
TheDeferred.Arguments = function (args) { this.args = Array.prototype.slice.call(args, 0) };

/**
 * Try func (returns TheDeferred) till it finish without exceptions.
 *
 * @example
 *   TheDeferred.retry(3, function () {
 *       return http.get(...);
 *   }).
 *   next(function (res) {
 *       res //=> response if succeeded
 *   }).
 *   error(function (e) {
 *       e //=> error if all try failed
 *   });
 *
 * @param {number} retryCount
 * @param {function(number):TheDeferred} funcTheDeferred
 * @param {{wait:number}} options
 * @return {TheDeferred}
 */
TheDeferred.retry = function (retryCount, funcTheDeferred, options) {
	if (!options) options = {};

	var wait = options.wait || 0;
	var d = new TheDeferred();
	var retry = function () {
		var m = funcTheDeferred(retryCount);
		m.
			next(function (mes) {
				d.call(mes);
			}).
			error(function (e) {
				if (--retryCount <= 0) {
					d.fail(['retry failed', e]);
				} else {
					setTimeout(retry, wait * 1000);
				}
			});
	};
	setTimeout(retry, 0);
	return d;
};

/**
 * default export methods
 *
 * @see TheDeferred.define
 */
TheDeferred.methods = ["parallel", "wait", "next", "call", "loop", "repeat", "chain"];
/**
 * export functions to obj.
 * @param {Object} obj
 * @param {Array.<string>=} list (default TheDeferred.methods)
 * @return {function():TheDeferred} The TheDeferred constructor function
 */
TheDeferred.define = function (obj, list) {
	if (!list) list = TheDeferred.methods;
	if (!obj)  obj  = (function getGlobal () { return this })();
	for (var i = 0; i < list.length; i++) {
		var n = list[i];
		obj[n] = TheDeferred[n];
	}
	return TheDeferred;
};

this.TheDeferred = TheDeferred;

