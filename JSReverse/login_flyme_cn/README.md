## 魅族

- 目标：魅族官网登录
- 主页：aHR0cHM6Ly9sb2dpbi5mbHltZS5jbi8=
- 接口：aHR0cHM6Ly9sb2dpbi5mbHltZS5jbi9zc28vbG9naW4=
- 逆向参数：
  Form Data：`password: %C5%94%C5%93%C5%92%C5%93%C5%94%C5%92%C5%94%C5%92`

## 逆向过程

### 抓包分析

来到魅族的登录页面，随便输入一个账号密码进行登录，抓包定位到登录接口为 aHR0cHM6Ly9sb2dpbi5mbHltZS5jbi9zc28vbG9naW4= ，POST 请求，Form Data 里，参数比较多，分析一下主要参数的含义：

- `cycode`：号码前缀；
- `account`：号码前缀 + 手机账号；
- `password`：密码，被加密处理了；
- `geetest_challenge`：极验（GeeTest）验证码相关参数；
- `geetest_validate`：极验（GeeTest）验证码相关参数；
- `geetest_seccode`：极验（GeeTest）验证码相关参数。

对于极验验证码的处理我们后面会专门写文章来进一步研究，在本案例中，我们只注重密码 `password` 加密方式的逆向。

![01.png](https://i.loli.net/2021/08/21/kXZUamlewhHE96s.png)

### 参数逆向

全局搜索 `password`，会发现在好几个 JS 文件里都有结果，我们注意到有个 login.js，很明显和登录有关，重点先关注一下这个 JS 文件，可以看到有两行代码：

```javascript
var kk = cryPP.generateMix();
data['password'] = cryPP.excutePP(data['password'], kk);
```

貌似是将明文的 password 经过一个函数处理过后再次写入 data 里面，比较可疑，埋下断点，重新点击登陆进行调试：

![02.png](https://i.loli.net/2021/08/21/pEGZhdRXaY7W6TI.png)

可以看到成功断下，经过这个函数处理后的结果正是最终我们需要的值，观察用到的两个函数：`cryPP.generateMix()` 和 `cryPP.excutePP()`，鼠标放上去可以看到是调用了 cryPP.min.js 的加密函数：

![03.png](https://i.loli.net/2021/08/21/ZtvxKDLh7RFB5Xz.png)

直接跟进这个函数，来到 cryPP.min.js 可以看到这两个加密方法：

![04.png](https://i.loli.net/2021/08/21/J6BXnlgvGtabfxF.png)

我们直接改写一下整个加密代码，直接重写为两个方法即可：

```javascript
function excutePP(r, e) {
    for (var n = "", t = 0; t < r.length; t++) {
        var o = e ^ r.charCodeAt(t);
        n += String.fromCharCode(o)
    }
    return encodeURIComponent(n)
}

function generateMix(r) {
    return Math.ceil(1e3 * Math.random())
}

function getEncryptedPassword(password) {
    var kk = generateMix();
    return excutePP(password, kk);
}

// 测试样例
// console.log(getEncryptedPassword("12345678"))
```

当然，改写成对象的形式也可以：

```javascript
var cryPP = {}

cryPP.excutePP = function (r, e) {
    for (var n = "", t = 0; t < r.length; t++) {
        var o = e ^ r.charCodeAt(t);
        n += String.fromCharCode(o)
    }
    return encodeURIComponent(n)
}

cryPP.generateMix = function (r) {
    return Math.ceil(1e3 * Math.random())
}


function getEncryptedPassword(password) {
    var kk = cryPP.generateMix();
    return cryPP.excutePP(password, kk);
}

// 测试样例
// console.log(getEncryptedPassword("12345678"))
```
