![](https://i.loli.net/2021/08/07/JbP4zaS2TxU6Rkd.png)

> 关注微信公众号：K哥爬虫，QQ交流群：808574309，持续分享爬虫进阶、JS/安卓逆向等技术干货！

## 声明

**本文章中所有内容仅供学习交流，抓包内容、敏感网址、数据接口均已做脱敏处理，严禁用于商业用途和非法用途，否则由此产生的一切后果均与作者无关，若有侵权，请联系我立即删除！**

## 逆向目标

- 目标：KW音乐搜索参数
- 主页：`aHR0cDovL3d3dy5rdXdvLmNuLw==`
- 接口：`aHR0cDovL3d3dy5rdXdvLmNuL2FwaS93d3cvc2VhcmNoL3NlYXJjaE11c2ljQnlrZXlXb3Jk`
- 逆向参数：Query String Parameters：`reqId: 15c31270-32e8-11ec-a637-0b779ce474e4`


本次的逆向目标是搜索接口的一个参数 reqId，注意这个参数并不是必须的，本文的主要目的是介绍分离式 webpack，即模块加载器与各个模块不在同一个 JS 文件里时，该如何改写 webpack，以及如何通过非 IIFE（立即调用函数表达式、自执行函数）的方式对 webpack 进行改写，本篇文章是对往期文章的一个扩充：

- [爬虫逆向基础，理解 JavaScript 模块化编程 webpack](https://mp.weixin.qq.com/s/_-9Ib6H51rWGK60X_g2n1g)
- [【JS 逆向百例】webpack 改写实战，G 某游戏 RSA 加密](https://mp.weixin.qq.com/s/LCnpt37NjiTtBYToqNdQaA)

## 逆向过程

### 抓包分析

来到搜索页面，随便搜索一搜歌曲，抓包到接口类为 `aHR0cDovL3d3dy5rdXdvLmNuL2FwaS93d3cvc2VhcmNoL3NlYXJjaE11c2ljQnlrZXlXb3Jk`，GET 请求，Query String Parameters 里有个 reqId 加密参数，如下图所示：

![01.png](https://i.loli.net/2021/10/22/MEuULAIGisHfDZj.png)

### 参数逆向

直接全局搜索 reqId，仅在 app.4eedc3a.js 文件里面有 4 个结果，如下图所示：

![02.png](https://i.loli.net/2021/10/22/HY3pNVEIPxQCZqU.png)

很明显 `t.data.reqId = r` 和 `t.data.reqId = n` 是比较可疑的，尝试在这两个地方埋下断点，会发现刷新网页或者重新搜索无法断下，我们观察一下这两个地方，`r` 和 `n` 的定义语句 `var r = c()();`、`var n = c()();` 都是 由 `c()()` 得到的，我们尝试在这两个位置埋下断点，重新搜索，可以发现成功断下，而 `c()()` 的值正是 reqId 的值，如下图所示：

![03.png](https://i.loli.net/2021/10/22/AfsGc2lDzmnCNSu.png)

继续往上找，看看 c 是怎么来的，可以看到一下逻辑：

```javascript
var l = n(109)
  , c = n.n(l)
var r = c()();
```

埋下断点进行调试，可以看到 n 其实是 runtime.d5e801d.js 里面的一个方法，如下图所示：

![04.png](https://i.loli.net/2021/10/22/q1cZKmQSsd6R4eN.png)

观察这个 `function d(n){}`，return 语句用到了 `.call` 语法，里面还有 `exports` 关键字，通过 K 哥往期文章的介绍，很容易知道这是一个 webpack 的模块加载器，那么 `e` 就包含了所有模块，如下图所示：

![05.png](https://i.loli.net/2021/10/22/4ZAiodGNPjOfDU7.png)

我们再观察一下 `n(109)`，点击进入这个函数，可以发现和前后函数用逗号分隔，划到这个文件的结尾，可以看到有 `]` 符号，这说明 webpack 的所有模块都封装在一个数组里面，那么这个 109 就代表这个函数是第 109 个函数，如下图所示：

![06.png](https://i.loli.net/2021/10/22/9BixCcIRUy5edrn.png)

再看看 `c = n.n(l)` 语句，选中 `n.n` 点击会发现同样来到模块加载器这里，那么到时候扣代码的时候把 `d.n` 也扣下来即可。

![07.png](https://i.loli.net/2021/10/22/3KTeBfwXlHQou7m.png)

那么总结一下逻辑，语句 `l = n(109)`，利用模块加载器，加载了第 109 个函数，返回值赋值给 `l`，然后 `c = n.n(l)` 调用模块加载器的 `n` 方法，返回值赋值给 `c`，然后执行 `c()()` 就得到 reqId 的值了。

## webpack 改写

在 K 哥往期的文章已经介绍过 webpack 的改写方法，本次案例 K 哥将会介绍三种方法，也可以分为两种，一种是 IIFE（立即调用函数表达式、自执行函数） 方式，只不过传的参数，也就是模块的格式，分为数组和字典两种，第二种是非 IIFE 方式，比较常规的改写方法，看起来也比较容易理解一点。PS：完整代码不太好看清楚整个的结构，可以使用 VSCode 等工具折叠所有代码，就可以清楚地看到不同改写方法下，代码的不同结构了。

通过前面的分析，我们知道模块加载器里用到了 `d.n`，实际调试还用到了 `d.d` 和 `d.o`，所以都要一起扣下来。

模块部分，我们已经知道调用了 109 这个模块，而观察 109 的代码， 发现还调用了 202 和 203 模块，所以需要将这三个模块都 copy 下来，copy 的时候，我们首先断点运行到模块加载器，由于 `e` 储存了所有模块，所以我们可以直接在 Console 里调用 `e[109]`、`e[202]`、`e[203]` 输出一下，然后点击就可以跳到原函数的位置，然后再 copy 下来即可，如下图所示：

![08.png](https://i.loli.net/2021/10/22/uS3JqQKi6s9zM7c.png)

### IIFE 传数组

在 K 哥往期的文章中已经介绍过 IIFE 的改写方法，同样的，我们首先定义一个全局变量，比如 `var kuwo;`，然后导出模块加载器 `kuwo = d`，然后将 109、202、203 这三个模块组成的数组传入 IIFE，那么这里不再是第 109、202、203 个模块，而是第 0、1、2 个模块，所以在调用模块的时候也要将对应的 109、202、203 改为 0、1、2，完整代码如下所示：

```javascript
var kuwo;

!function (e){
    var t = {};

    function d(n) {
        if (t[n]) return t[n].exports;
        var r = t[n] = {
            i: n,
            l: !1,
            exports: {}
        };
        return e[n].call(r.exports, r, r.exports, d),
            r.l = !0,
            r.exports
    }

    d.n = function (e) {
        var n = e && e.__esModule ?
            function () {
                return e.default
            } :
            function () {
                return e
            };
        return d.d(n, "a", n),
            n
    },
    d.d = function (e, n, r) {
            d.o(e, n) || Object.defineProperty(e, n, {
                enumerable: !0,
                get: r
            })
        },
    d.o = function (object, e) {
            return Object.prototype.hasOwnProperty.call(object, e)
        }

    kuwo = d
}([
    function (t, e, n) {
        var r, o, l = n(1),
            c = n(2),
            h = 0,
            d = 0;
        t.exports = function (t, e, n) {
            var i = e && n || 0,
                b = e || [],
                f = (t = t || {}).node || r,
                v = void 0 !== t.clockseq ? t.clockseq : o;
            if (null == f || null == v) {
                var m = l();
                null == f && (f = r = [1 | m[0], m[1], m[2], m[3], m[4], m[5]]),
                null == v && (v = o = 16383 & (m[6] << 8 | m[7]))
            }
            var y = void 0 !== t.msecs ? t.msecs : (new Date).getTime(),
                w = void 0 !== t.nsecs ? t.nsecs : d + 1,
                dt = y - h + (w - d) / 1e4;
            if (dt < 0 && void 0 === t.clockseq && (v = v + 1 & 16383), (dt < 0 || y > h) && void 0 === t.nsecs && (w = 0), w >= 1e4) throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
            h = y,
                d = w,
                o = v;
            var x = (1e4 * (268435455 & (y += 122192928e5)) + w) % 4294967296;
            b[i++] = x >>> 24 & 255,
                b[i++] = x >>> 16 & 255,
                b[i++] = x >>> 8 & 255,
                b[i++] = 255 & x;
            var _ = y / 4294967296 * 1e4 & 268435455;
            b[i++] = _ >>> 8 & 255,
                b[i++] = 255 & _,
                b[i++] = _ >>> 24 & 15 | 16,
                b[i++] = _ >>> 16 & 255,
                b[i++] = v >>> 8 | 128,
                b[i++] = 255 & v;
            for (var A = 0; A < 6; ++A) b[i + A] = f[A];
            return e || c(b)
        }
    },
    function (t, e) {
        var n = "undefined" != typeof crypto && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || "undefined" != typeof msCrypto && "function" == typeof window.msCrypto.getRandomValues && msCrypto.getRandomValues.bind(msCrypto);
        if (n) {
            var r = new Uint8Array(16);
            t.exports = function () {
                return n(r),
                    r
            }
        } else {
            var o = new Array(16);
            t.exports = function () {
                for (var t, i = 0; i < 16; i++) 0 == (3 & i) && (t = 4294967296 * Math.random()),
                    o[i] = t >>> ((3 & i) << 3) & 255;
                return o
            }
        }
    },
    function (t, e) {
        for (var n = [], i = 0; i < 256; ++i) n[i] = (i + 256).toString(16).substr(1);
        t.exports = function (t, e) {
            var i = e || 0,
                r = n;
            return [r[t[i++]], r[t[i++]], r[t[i++]], r[t[i++]], "-", r[t[i++]], r[t[i++]], "-", r[t[i++]], r[t[i++]], "-", r[t[i++]], r[t[i++]], "-", r[t[i++]], r[t[i++]], r[t[i++]], r[t[i++]], r[t[i++]], r[t[i++]]].join("")
        }
    }
])

function getReqId() {
    var l = kuwo(0),
        c = kuwo.n(l),
        r = c()()
    return r
}

// console.log(getReqId())
```

### IIFE 传字典

那么同样的 IIFE，我们将 109、202、203 这三个模块组成的字典传入 IIFE，键就依次取名为 109、202、203，值就是对应的函数，那么在调用对应的函数的时候就直接取键名就行了，比如 `var c = n(203)`，这里需要注意的是，如果函数名不是数字，在调用时就要加引号，比如函数名为 `f203`，调用语句就应该是  `var c = n("f203")`，完整代码如下所示：

```javascript
var kuwo;

!function(e) {
	var t = {};

	function d(n) {
		if (t[n]) return t[n].exports;
		var r = t[n] = {
			i: n,
			l: !1,
			exports: {}
		};
		return e[n].call(r.exports, r, r.exports, d),
		r.l = !0,
		r.exports
	}

	d.n = function(e) {
		var n = e && e.__esModule ?
		function() {
			return e.
		default
		}:
		function() {
			return e
		};
		return d.d(n, "a", n),
		n
	},
	d.d = function(e, n, r) {
		d.o(e, n) || Object.defineProperty(e, n, {
			enumerable: !0,
			get: r
		})
	},
	d.o = function(object, e) {
		return Object.prototype.hasOwnProperty.call(object, e)
	}

    kuwo = d
} ({
	109 : function(t, e, n) {
		var r, o, l = n(202),
		c = n(203),
		h = 0,
		d = 0;
		t.exports = function(t, e, n) {
			var i = e && n || 0,
			b = e || [],
			f = (t = t || {}).node || r,
			v = void 0 !== t.clockseq ? t.clockseq: o;
			if (null == f || null == v) {
				var m = l();
				null == f && (f = r = [1 | m[0], m[1], m[2], m[3], m[4], m[5]]),
				null == v && (v = o = 16383 & (m[6] << 8 | m[7]))
			}
			var y = void 0 !== t.msecs ? t.msecs: (new Date).getTime(),
			w = void 0 !== t.nsecs ? t.nsecs: d + 1,
			dt = y - h + (w - d) / 1e4;
			if (dt < 0 && void 0 === t.clockseq && (v = v + 1 & 16383), (dt < 0 || y > h) && void 0 === t.nsecs && (w = 0), w >= 1e4) throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
			h = y,
			d = w,
			o = v;
			var x = (1e4 * (268435455 & (y += 122192928e5)) + w) % 4294967296;
			b[i++] = x >>> 24 & 255,
			b[i++] = x >>> 16 & 255,
			b[i++] = x >>> 8 & 255,
			b[i++] = 255 & x;
			var _ = y / 4294967296 * 1e4 & 268435455;
			b[i++] = _ >>> 8 & 255,
			b[i++] = 255 & _,
			b[i++] = _ >>> 24 & 15 | 16,
			b[i++] = _ >>> 16 & 255,
			b[i++] = v >>> 8 | 128,
			b[i++] = 255 & v;
			for (var A = 0; A < 6; ++A) b[i + A] = f[A];
			return e || c(b)
		}
	},
	202 : function(t, e) {
		var n = "undefined" != typeof crypto && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || "undefined" != typeof msCrypto && "function" == typeof window.msCrypto.getRandomValues && msCrypto.getRandomValues.bind(msCrypto);
		if (n) {
			var r = new Uint8Array(16);
			t.exports = function() {
				return n(r),
				r
			}  
		} else {
			var o = new Array(16);
			t.exports = function() {
				for (var t, i = 0; i < 16; i++) 0 == (3 & i) && (t = 4294967296 * Math.random()),
				o[i] = t >>> ((3 & i) << 3) & 255;
				return o
			}
		}
	},
	203 : function(t, e) {
		for (var n = [], i = 0; i < 256; ++i) n[i] = (i + 256).toString(16).substr(1);
		t.exports = function(t, e) {
			var i = e || 0,
			r = n;
			return [r[t[i++]], r[t[i++]], r[t[i++]], r[t[i++]], "-", r[t[i++]], r[t[i++]], "-", r[t[i++]], r[t[i++]], "-", r[t[i++]], r[t[i++]], "-", r[t[i++]], r[t[i++]], r[t[i++]], r[t[i++]], r[t[i++]], r[t[i++]]].join("")
		}
	}
})

function getReqId() {
	var l = kuwo(109),
	c = kuwo.n(l),
	r = c()()
    return r
}

// console.log(getReqId())
```

### 非 IIFE 常规改写

通过前面的分析，我们已经知道 webpack 的模块加载器里面，`e` 包含了所有模块，然后定义全局变量把模块加载器导出来，再依次调用 `e` 里面的模块，其实也可以不使用 IIFE 的方式，就和我们常规的函数调用一样，首先把用到的三个模块，直接在外面定义出来，然后将三个模块封装成一个字典或者数组，将字典或者数组赋值给 `e`，然后将原来的模块加载器 `function d(n){}` 也直接拿出来，参数 `n` 表示要调用 `e` 里面的哪个函数，传入对应的名称或者下标即可。完整代码如下：

```javascript
var f109 = function(t, e, n) {
	var r, o, l = n(1),
	c = n(2),
	h = 0,
	d = 0;
	t.exports = function(t, e, n) {
		var i = e && n || 0,
		b = e || [],
		f = (t = t || {}).node || r,
		v = void 0 !== t.clockseq ? t.clockseq: o;
		if (null == f || null == v) {
			var m = l();
			null == f && (f = r = [1 | m[0], m[1], m[2], m[3], m[4], m[5]]),
			null == v && (v = o = 16383 & (m[6] << 8 | m[7]))
		}
		var y = void 0 !== t.msecs ? t.msecs: (new Date).getTime(),
		w = void 0 !== t.nsecs ? t.nsecs: d + 1,
		dt = y - h + (w - d) / 1e4;
		if (dt < 0 && void 0 === t.clockseq && (v = v + 1 & 16383), (dt < 0 || y > h) && void 0 === t.nsecs && (w = 0), w >= 1e4) throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
		h = y,
		d = w,
		o = v;
		var x = (1e4 * (268435455 & (y += 122192928e5)) + w) % 4294967296;
		b[i++] = x >>> 24 & 255,
		b[i++] = x >>> 16 & 255,
		b[i++] = x >>> 8 & 255,
		b[i++] = 255 & x;
		var _ = y / 4294967296 * 1e4 & 268435455;
		b[i++] = _ >>> 8 & 255,
		b[i++] = 255 & _,
		b[i++] = _ >>> 24 & 15 | 16,
		b[i++] = _ >>> 16 & 255,
		b[i++] = v >>> 8 | 128,
		b[i++] = 255 & v;
		for (var A = 0; A < 6; ++A) b[i + A] = f[A];
		return e || c(b)
	}
};
var f202 = function(t, e) {
	var n = "undefined" != typeof crypto && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || "undefined" != typeof msCrypto && "function" == typeof window.msCrypto.getRandomValues && msCrypto.getRandomValues.bind(msCrypto);
	if (n) {
		var r = new Uint8Array(16);
		t.exports = function() {
			return n(r),
			r
		}
	} else {
		var o = new Array(16);
		t.exports = function() {
			for (var t, i = 0; i < 16; i++) 0 == (3 & i) && (t = 4294967296 * Math.random()),
			o[i] = t >>> ((3 & i) << 3) & 255;
			return o
		}
	}
};
var f203 = function(t, e) {
	for (var n = [], i = 0; i < 256; ++i) n[i] = (i + 256).toString(16).substr(1);
	t.exports = function(t, e) {
		var i = e || 0,
		r = n;
		return [r[t[i++]], r[t[i++]], r[t[i++]], r[t[i++]], "-", r[t[i++]], r[t[i++]], "-", r[t[i++]], r[t[i++]], "-", r[t[i++]], r[t[i++]], "-", r[t[i++]], r[t[i++]], r[t[i++]], r[t[i++]], r[t[i++]], r[t[i++]]].join("")
	}
};

var e = [f109, f202, f203];

function d(n) {
	var t = {};
	if (t[n]) return t[n].exports;
	var r = t[n] = {
		i: n,
		l: !1,
		exports: {}
	};
	return e[n].call(r.exports, r, r.exports, d),
	r.l = !0,
	r.exports
}

d.n = function(e) {
	var n = e && e.__esModule ?
	function() {
		return e.
	default
	}:
	function() {
		return e
	};
	return d.d(n, "a", n),
	n
},
d.d = function(e, n, r) {
	d.o(e, n) || Object.defineProperty(e, n, {
		enumerable: !0,
		get: r
	})
},
d.o = function(object, e) {
	return Object.prototype.hasOwnProperty.call(object, e)
};

function getReqId() {
	var l = d(0),
		c = d.n(l),
		r = c()()
    return r
}

// console.log(getReqId())
```
