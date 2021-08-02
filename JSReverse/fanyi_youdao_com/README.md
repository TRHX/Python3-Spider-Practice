## 有道翻译

- 目标：有道翻译接口参数
- 主页：https://fanyi.youdao.com/
- 接口：https://fanyi.youdao.com/translate_o?smartresult=dict&smartresult=rule
- 逆向参数：
    - Form Data：
        - `salt: 16261583727540`
        - `sign: 151e4b19b07ae410e0e1861a6706d30c`
        - `lts: 1626158372754`
        - `bv: 5b3e307b66a6c075d525ed231dcc8dcd`

## 分析过程

四个加密参数，全局搜索任意一个，搜索结果比较多，依次对比，可以发现第 8969 行左右开始，Form Data 所有的参数都齐全了，埋下断点调试一下，可以看到所有数据和最终结果一致，加密的四个参数都在 r 当中取值，跟踪 r，往上找可以看到 `r = v.generateSaltSign(n);`，其中 n 是输入的待翻译的字符串，跟踪 `generateSaltSign` 函数，可以看到关键的加密代码：

![01.png](https://i.loli.net/2021/07/13/7QONtMZrmJ6GzLX.png)

![02.png](https://i.loli.net/2021/07/13/DoYSE2TQHRvujgi.png)

```javascript
var r = function(e) {
    var t = n.md5(navigator.appVersion)
      , r = "" + (new Date).getTime()
      , i = r + parseInt(10 * Math.random(), 10);
    return {
        ts: r,
        bv: t,
        salt: i,
        sign: n.md5("fanyideskweb" + e + i + "Y2FYu%TNSbMCxc3t2u^XT")
    }
};
```

`navigator.appVersion` 就是 UserAgent

`bv` 的值由 UserAgent 经过 MD5 加密得到

`ts` 的值为 13 位时间戳

`salt` 的值由 `ts` 的值加上一个 0-9 的随机整数得到

`sign` 的值由待翻译的字符串、`salt` 的值和另外两个固定的字符串由 MD5 加密得到

这个过程比较简单，可以使用 Python 来复现，或者直接引用 JS，使用 nodejs 里面的加密模块 CryptoJS 来进行 MD5 加密，改写 JS 如下：

```javascript
// 引用 crypto-js 加密模块
var CryptoJS = require('crypto-js')

function getEncryptedParams(data, ua) {
    var bv = CryptoJS.MD5(ua).toString()
        , lts = "" + (new Date).getTime()
        , salt = lts + parseInt(10 * Math.random(), 10)
    var sign = CryptoJS.MD5('fanyideskweb'+data+salt+']BjuETDhU)zqSxf-=B#7m').toString()
    return {bv: bv, lts: lts, salt: salt, sign: sign}
}
```