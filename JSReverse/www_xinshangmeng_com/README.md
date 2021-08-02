## 中烟新商盟

- 目标：中烟新商盟登录
- 主页：http://www.xinshangmeng.com/xsm2/?Version=2021061900
- 接口：http://login.xinshangmeng.com/login/users/dologin/dfaup
- 逆向参数：
  - Query String Parameters：
    - `jsonp: jQuery999004301464652688636_1626077252402`
    - `j_mcmm: 351faaef3ba8f4db2001ec621344dbbf`
    - `j_valcode: 5807`
    - `_: 1626077333760`
  
## 分析过程

jsonp 这个参数，在登录请求成功或者失败后，会返回一个类似 `jQuery999004301464652688636_1626077252402(xxxxxxxxxxxxxx)` 的东西，也就是你发送的 jsonp 值等于返回内容开头的这一段值，类似于回调函数，在全局搜索里面没有发现可以生成这个参数的地方，观察 `_` 后面 16 开头的 13 位数字，不难发现这是一个时间戳，至于前面的一串数字，随机生成就可以了。同样的还有个 `_` 参数，也是时间戳，`j_valcode` 是验证码，那么就剩下 `j_mcmm` 这个参数了，可以看出这是密码经过一系列处理之后得到的，抓包分析：

![01.png](https://i.loli.net/2021/07/12/oN3SlMbpXRGI56A.png)

经过对比，可以发现第 1132 行 `g.j_mcmm = b` 语句中，b 的值就是最终加密后的值，往上找，第 1125 和 1126 行 `var e = b;` `b = F(F(b) + c);`，把明文密码赋值给 b，c 为验证码，经过 F 这个函数的处理后得到加密值，跟进 F 函数：

![02.png](https://i.loli.net/2021/07/12/WPFilYcpAEuqfMO.png)

可以看到其实就是经过以下函数的处理：

```javascript
function d(a) {
    return n(e(o(m(a + "{1#2$3%4(5)6@7!poeeww$3%4(5)djjkkldss}")), 32))
}
```

这个函数中，又包含 n, e, o, m 函数，这里不再每个函数去剥离，直接将这个函数往下所有单个字母的函数 copy 下来即可。

## 加密 JS 剥离

关键 JS 加密代码架构：

```javascript
function getEncryptedPassword(a, b, c) {
    // a: 用户名, b: 密码, c: 验证码
    function d(a) {
        return n(e(o(m(a + "{1#2$3%4(5)6@7!poeeww$3%4(5)djjkkldss}")), 32))
    }

    function e(a, b) {}

    function f(a, b, c, d, e, f) {}

    function g(a, b, c, d, e, g, h) {}

    function h(a, b, c, d, e, g, h) {}

    function i(a, b, c, d, e, g, h) {}

    function j(a, b, c, d, e, g, h) {}

    function k(a, b)  {}

    function l(a, b)  {}

    function m(a)  {}

    function n(a)  {}

    function o(a)  {}

    c.hex_md5 = d
    b = d(d(b) + c);
    return b
}

// 测试样例
// console.log(getEncryptedPassword('123123', '1231234', '6798'))
```
