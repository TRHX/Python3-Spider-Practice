## 360

- 目标：360 登录
- 主页：https://i.360.cn/login/
- 接口：https://login.189.cn/web/login
- 逆向参数：
  Form Data：
  ```text
  password: 61b80f94cdd6d632f7bc38fd9ed91d9c
  token: 0c3590c46a9c662a
  qucrypt_code: D6TqMQxFspnphxHSGa34EpyaPSfJ%2BlG1zoOgz2s%2FBUDzFWyScEeERZ2PpiIsB7EnMavSiCYTb1Y%3D
  ```

## 逆向过程

### 抓包分析

来到 360 的登录页面，随便输入一个账号密码，点击登陆，抓包定位到登录接口为 https://login.360.cn/ ，POST 请求，Form Data 里，密码 password 被加密处理了，token 暂时不知道是什么加密，再多登录几次，就会出现验证码，有验证码的情况下，多了 captcha 和 qucrypt_code 两个参数，captcha 就是验证码的值，qucrypt_code 也是一个加密参数，暂时不知道怎么来的。

![01.png](https://i.loli.net/2021/08/17/1iA7gxLthaDWdP2.png)

### 参数逆向

#### qucrypt_code

首先来看看和验证码一起出现的 qucrypt_code 参数，尝试直接搜索它的值，可以看到是前面向 https://passport.360.cn/captcha.php 发送 GET 请求返回得到的，这个请求返回的内容类似于：

```text
jQuery112407377728108257877_1629184718156({
 "image":"\/9j\/4AAQSkZJRgABAQAAAQAB......UAFFFFAH\/\/2Q==",
 "qucap_style":2,
 "qucrypt_code":"D6TqMQxFsplNrQgf9zO7ueP2cDziT%2BnCmXEwgjJM82S6Pzgj%2B0ibrXTN6mjxcBAoM4SSaNN1CBc%3D",
 "errno":"0",
 "errmsg":"OK"
})
```

通过对比可以发现，image 的值就是验证码的 base64 数据，可以直接拿过来使用 Python 的 base64.b64decode 方法将其转为图片文件。

这个请求 Query String Parameters 里，同样也有几个未知的参数：userip、sign、r、callback，其中 callback 是回调参数，格式为：`jQuery + 21位数字 + _ + 13位时间戳`，它的值不影响请求结果。

![02.png](https://i.loli.net/2021/08/17/eaPqXAWUpC6n18N.png)

和前面的 qucrypt_code 参数一样，我们可以猜测这几个参数也是通过某个请求得到的，往上找一下抓到的包，可以看到有一个向 https://login.360.cn/ 发送的 GET 请求，返回的 captchaUrl 里面就有这些参数，直接拿下来解析一下即可，值得注意的是还有个 captchaFlag 参数，而且这个请求的 Query String Parameters 里，有个 m 参数，值为 checkNeedCaptcha，那么就可以猜测 captchaFlag 为 True 就表示需要验证码，为 False 就不需要验证码，通过实际抓包对比可以证明猜测是正确的，这个逻辑就可以加到 Python 代码中。

![03.png](https://i.loli.net/2021/08/17/LIxcstdm5Weqhn8.png)

#### token

token 的值，直接搜索发现，它也是通过向 https://login.360.cn/ 发送 GET 请求返回得到的：

![04.png](https://i.loli.net/2021/08/17/dK1NHbYLCiZ6FBk.png)

#### password

password 是通过 JS 加密的，全局搜索 `password =`，可以在 quc-i360.js 里面找到 5 个关键地方，没有太明显的函数名可以直接看出来加密的地方，直接全部埋下断点进行调试，最后是在大约第 7952 行处断下，可以看到明文密码经过 o 函数处理后就变成了加密后的值：

![05.png](https://i.loli.net/2021/08/17/S1LnEFvDUqlr4G2.png)

跟进 o 函数，只有一句 `return e && 32 != e.length ? p.utils.md5(e) : e`：

![06.png](https://i.loli.net/2021/08/17/MJFcqI48gj3QZt5.png)

跟进 p.utils.md5，将整个函数剥离下来进行本地调试即可：

![07.png](https://i.loli.net/2021/08/17/ICvfMgPNk1Fx8R6.png)

## 加密 JS 剥离

password 参数，关键 JS 加密代码架构：

```javascript
function t(e, t) {}

function n(e, t) {}

function i(e, i, r, o, a, c) {}

function r(e, t, n, r, o, a, c) {}

// 此处省略 N 个函数

function v(e, t) {}

function q(e, t) {}

function md5(e, t) {
    return t ? q(t, e) : g(e)
}

function getEncryptedPassword(e) {
    return e && 32 != e.length ? md5(e) : e
}

// 测试样例
// console.log(getEncryptedPassword("12345678"))
```
