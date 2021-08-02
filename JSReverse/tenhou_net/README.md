## 天凤麻将

- 目标：天凤麻将网页数据
- 主页：https://tenhou.net/2/?q=336m237p2479s167z3s
- 逆向参数：网页中的数据

## 分析过程

本次要拿的数据直接抓包是没有的，这种数据是通过 JS 代码插入到标签里面的，全局搜索标签或者它的上级标签来定位数据生成的地方：

![01.png](https://i.loli.net/2021/07/12/7Y4Mayih8BICKEu.png)

![02.png](https://i.loli.net/2021/07/12/DWFQJhAaCRUp6zk.png)

可以发现第 913 行 `document.getElementById("m2").innerHTML = d + "<br>"` 是向 `m2` 标签里面插入值 `d` 和换行符，一步一步往上看，可以发现 `d` 包含了很多 html 的东西，而上面的 `g` 只有文本，刚好是目标数据，继续往上跟踪，步骤太复杂，直接将这部分函数整个复制下来运行（第 794 行 - 第 914 行）， 运行会提示 `ga` 未定义，通过断点分析会发现 `ga` 的值是固定的 `q`，再次运行又会提示 `O` 未定义，同样断点分析可以发现 `O` 就是 URL 后面 `q` 的值，如：`336m237p2479s167z3s`，接着运行会发现还引用了其他函数，所以将这个函数以前的函数都复制下来一起运行即可。

## 加密 JS 剥离

关键 JS 加密代码架构：

```javascript
// Copyrights C-EGG inc.

var u = function () {}();

function w() {}

w.prototype = {};

function x(b, a, g, d) {}

// 此处省略 N 个函数

function M(b) {}

function N(b, a) {}

function ea(b) {}

function fa(O) {
    function b(a, b) {
        var c, d = 0;
        for (c = 0; c < a.length; ++c) d += 4 - b[a[c]];
        return d
    }

    // var a = ga, g = O, d;
    var a = 'q', g = O, d;
    d = "<hr size=1 color=#CCCCCC >";
    switch (a.substr(0, 1)) {
        case "q":
            d += '標準形(七対国士を含む)の計算結果 / <a href="?p' + a.substr(1) + "=" + g + '">一般形</a><br>';
            break;
        case "p":
            d += '一般形(七対国士を含まない)の計算結果 / <a href="?q' + a.substr(1) + "=" + g + '">標準形</a><br>'
    }
    for (var c = "d" == a.substr(1, 1), a = a.substr(0, 1), g = g.replace(/(\d)(\d{0,8})(\d{0,8})(\d{0,8})(\d{0,8})(\d{0,8})(\d{0,8})(\d{8})(m|p|s|z)/g, "$1$9$2$9$3$9$4$9$5$9$6$9$7$9$8$9").replace(/(\d?)(\d?)(\d?)(\d?)(\d?)(\d?)(\d)(\d)(m|p|s|z)/g, "$1$9$2$9$3$9$4$9$5$9$6$9$7$9$8$9").replace(/(m|p|s|z)(m|p|s|z)+/g, "$1").replace(/^[^\d]/, ""), g = g.substr(0, 28), f = aa(g), r = -1; r = Math.floor(136 * Math.random()), f[r];) ;
    var m = Math.floor(g.length / 2) % 3;
    2 == m || c || (f[r] = 1, g += H(r));
    var f = ca(f),
        n = "",
        e = G(f, 34),
        n = n + N(e, 28 == g.length),
        n = n + ("(" + Math.floor(g.length / 2) + "枚)");
    -1 == e[0] && (n += ' / <a href="?" >新しい手牌を作成</a>');
    var n = n + "<br/>",
        q = "q" == a ? e[0] : e[1],
        k,
        p,
        l = Array(35);
    if (0 == q && 1 == m && c) k = 34,
        l[k] = K(f),
    l[k].length && (l[k] = {
        i: k,
        n: b(l[k], f),
        c: l[k]
    });
    else if (0 >= q) for (k = 0; 34 > k; ++k) f[k] && (f[k]--, l[k] = K(f), f[k]++, l[k].length && (l[k] = {
        i: k,
        n: b(l[k], f),
        c: l[k]
    }));
    else if (2 == m || 1 == m && !c) for (k = 0; 34 > k; ++k) {
        if (f[k]) {
            f[k]--;
            l[k] = [];
            for (p = 0; 34 > p; ++p) k == p || 4 <= f[p] || (f[p]++, F(f, "p" == a) == q - 1 && l[k].push(p), f[p]--);
            f[k]++;
            l[k].length && (l[k] = {
                i: k,
                n: b(l[k], f),
                c: l[k]
            })
        }
    } else {
        k = 34;
        l[k] = [];
        for (p = 0; 34 > p; ++p) 4 <= f[p] || (f[p]++, F(f, "p" == a) == q - 1 && l[k].push(p), f[p]--);
        l[k].length && (l[k] = {
            i: k,
            n: b(l[k], f),
            c: l[k]
        })
    }
    var t = [];
    for (k = 0; k < g.length; k += 2) {
        p = g.substr(k, 2);
        var v = ba(p),
            h = J(g.replace(p, "").replace(/(\d)(m|p|s|z)/g, "$2$1$1,").replace(/00/g, "50").split(",").sort().join("").replace(/(m|p|s|z)\d(\d)/g, "$2$1")),
            R = q + 1,
            I = l[v];
        I && I.n && (R = -1 == q ? 0 : q, void 0 == I.q && t.push(I), I.q = h);
        2 == m && (h += H(r));
        n += (2 == m || 2 != m && !c ? da : L)(p, 2 == k % 3 && k == g.length - 2 ? " hspace=3 " : "", a, h, v, R)
    }
    l[34] && l[34].n && (l[34].q = J(g), t.push(l[34]), n += '<br><br><a href="?' + a + "=" + l[34].q + '">次のツモをランダムに追加</a>');
    t.sort(function (a, b) {
        return b.n - a.n
    });
    // g = "" + (document.f.q.value + "\n");
    g = "" + (O + "\n");
    d += "<table cellpadding=2 cellspacing=0 >";
    q = 0 >= q ? "待ち" : "摸";
    for (k = 0; k < t.length; ++k) {
        v = t[k].i;
        d += "<tr id=mda" + v + " ><td>";
        34 > v && (d += "打</td><td>" + ('<img src="https://cdn.tenhou.net/2/a/' + H(4 * v + 1) + '.gif" class=D />') + "</td><td>", g += "打" + H(4 * v + 1) + " ");
        d += q + "[</td><td>";
        g += q + "[";
        l = t[k].c;
        c = t[k].q;
        for (p = 0; p < l.length; ++p) r = H(4 * l[p] + 1),
            d += '<a href="?' + a + "=" + (c + r) + '" class=D onmouseover="daFocus(this,' + v + ');" onmouseout="daUnfocus();"><img src="https://cdn.tenhou.net/2/a/' + r + '.gif" border=0 /></a>',
            g += H(4 * l[p] + 1);
        d += "</td><td>" + t[k].n + "枚</td><td>]</td></tr>";
        g += " " + t[k].n + "枚]\n"
    }
    d = d + "</table><br><hr><br>" + ('<textarea rows=10 style="width:100%;font-size:75%;">' + g + "</textarea>");
    -1 == e[0] && (d = d + "<hr size=1 color=#CCCCCC >" + ea(f));
    // document.getElementById("tehai").innerHTML = n;
    // document.getElementById("tips").innerHTML = "";
    // document.getElementById("m2").innerHTML = d + "<br>"
    return g
}

// 测试样例
// console.log(fa('336m237p2479s167z3s'))
```