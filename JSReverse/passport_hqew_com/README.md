## 华强电子网

- 目标：华强电子网账号密码登录
- 主页：https://passport.hqew.com/login
- 接口：https://passport.hqew.com/Login/DoLogin  
- 逆向参数：
    - Form Data：
        - `UserName: MTIzMTIz`
        - `PassWord: MTIzMTIzNA==`
    - Cookie:
        - `Hqew_SessionId=5nvmirpuy2r2zk1i5k5eekvq;`
        - `HQEWVisitor=c2842a37-6b12-4c42-b37f-5540155f78fd;`
        - `Hm_lvt_9c14e7a660000edd280005fedf9fec5c=1626858793;`
        - `Hm_lpvt_9c14e7a660000edd280005fedf9fec5c=1626858793;`
        - `passport_e=2b2679e2c977e20e6a3e2a15ad4dbecf3de818fa`
    
## 分析过程

### 用户名密码

加密参数有用户名和密码、cookies 里面有5个加密参数，首先看一下用户名密码，首先会怀疑是 base64 加密，在线解密一下，确实是的，那么就可以直接用 Python 中的 base64 模块来实现，但是我们还是可以分析一下 JS 加密，全局搜索 UserName 或者 PassWord，只有一个 JS 文件里有这个关键字：

![01.png](https://i.loli.net/2021/07/21/EqaLRYXfcWk8PC9.png)

定位到可疑位置，埋下断点，跟进 `base64encode2()` 这个函数，可以看到返回的值就是加密后的值，直接把这个函数 copy 下来即可，在本地调试过程中还会发现 `base64EncodeChars` 这个值未定义，在开发者工具中鼠标直接选中它，就会看到它的值，在右边的全局变量里也可以看到，在本地直接将其重新定义即可 `var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"`：

![02.png](https://i.loli.net/2021/07/21/LtNx2TDlvCX37sR.png)

### Cookie

Cookie 有以下几个值：

```text
Hqew_SessionId=5nvmirpuy2r2zk1i5k5eekvq; 
HQEWVisitor=c2842a37-6b12-4c42-b37f-5540155f78fd;
Hm_lvt_9c14e7a660000edd280005fedf9fec5c=1626858793;
Hm_lpvt_9c14e7a660000edd280005fedf9fec5c=1626858793;
passport_e=2b2679e2c977e20e6a3e2a15ad4dbecf3de818fa
```

首先我们会想到 session id 之类的东西有可能是第一次访问网页，Response Headers 里，Set-Cookie 带回来的值，Ctrl + F 搜索一下关键字 `Hqew_SessionId`，可以看到确实是第一次访问 Set-Cookie 设置的值：

![03.png](https://i.loli.net/2021/07/21/aHjVxsYuUcFdrBX.png)

同样方法搜索第二个参数 `HQEWVisitor`，可以看到是通过另一个链接请求返回得到的，这个请求链接的 Query String Parameters 里面有个 `r` 参数，同样也是 base64 加密，解密后就是 `/login`，那么就直接代入就行了：

![04.png](https://i.loli.net/2021/07/21/6wpMZt2xj8rkANF.png)

后面两个参数分别以 `Hm_lvt` 和 `Hm_lpvt` 开头，后面一串都是一样的，直接搜索整个字符串发现并没有结果，那么直接全局搜索相同的字符串，即 `9c14e7a660000edd280005fedf9fec5c`，可以看到，这个字符串就是 h.js 这个 JS 文件的 id，在首页的源码中也可以直接找到，经过测试，这个值并不会改变，所以直接写死即可，后面一串数字 `1626858793` 很明显是 10 位时间戳。

![05.png](https://i.loli.net/2021/07/21/KrMRi82yUTnNVGs.png)

最后一个参数 `passport_e`，直接全局搜索，只有一个地方，login.min.js 的 `ac` 函数里出现了这个关键字，埋下断点，清除 cookie 后刷新页面，可以看到成功断下，`t` 的值就是 `passport_e` 的值：

![06.png](https://i.loli.net/2021/07/21/IqGDSXapFOMhTJ7.png)

这个 `t` 怎么来的，往上找似乎并没有什么线索，那么我们直接看右边的调用栈，看执行这个函数之前执行了什么：

![07.png](https://i.loli.net/2021/07/22/5trbyaJq1TE2cNY.png)

可以看到在这里调用了 `ac` 函数，传入的 `encodestr` 这个值就是 `passport_e` 的值，往上看可以看到 `encodestr = sha1.hex(dt);`，也就是 `dt` 经过 SHA 加密后得到的，这个 `dt` 往上找是不太好找的，那么直接尝试全局搜索 `var dt` 看看是否有定义的地方，可以找到一行语句 `var dt = md5($("#J_randomstr").val());`，`dt` 实际上是取的元素 id 为 `J_randomstr` 的值，经过 MD5 加密后，再加上字符串 `hqew` 得到的：

![08.png](https://i.loli.net/2021/07/22/9nwGhqYRItr2bV3.png)

![09.png](https://i.loli.net/2021/07/22/nemOC4EqIhRgWvj.png)


## 总结

- 用户名密码通过 base64 加密，可以使用 Python 实现，也可以使用 JS 实现；

- Cookie 中，`Hqew_SessionId` 和 `HQEWVisitor` 是访问其他链接 Response Headers 里，Set-Cookie 设置的值；

- Cookie 中，`Hm_lpt` 和 `Hm_lpvt` 后面跟的字符串是定值，值为 10 位时间戳；

- Cookie 中，`passport_e` 由元素 id 为 `J_randomstr` 的值，经过 MD5 加密后，再加上字符串 `hqew`，最后经过 SHA1 加密后得到的；

- SHA1 加密可以把它的 JS 源码扣下来，但是比较麻烦，可以直接在本地配置 nodejs 环境，安装 crypto-js 包，引入即可。

## 加密 JS 剥离

```javascript
var CryptoJS = require('crypto-js')

function SHA1Encrypt(word) {
    return CryptoJS.SHA1(word).toString(CryptoJS.enc.Hex);
}

function base64encode2(e) {
    var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
    var a, c, r, o, t, n;
    for (r = e.length,
    c = 0,
    a = ""; c < r; ) {
        if (o = 255 & e.charCodeAt(c++),
        c == r) {
            a += base64EncodeChars.charAt(o >> 2),
            a += base64EncodeChars.charAt((3 & o) << 4),
            a += "==";
            break
        }
        if (t = e.charCodeAt(c++),
        c == r) {
            a += base64EncodeChars.charAt(o >> 2),
            a += base64EncodeChars.charAt((3 & o) << 4 | (240 & t) >> 4),
            a += base64EncodeChars.charAt((15 & t) << 2),
            a += "=";
            break
        }
        n = e.charCodeAt(c++),
        a += base64EncodeChars.charAt(o >> 2),
        a += base64EncodeChars.charAt((3 & o) << 4 | (240 & t) >> 4),
        a += base64EncodeChars.charAt((15 & t) << 2 | (192 & n) >> 6),
        a += base64EncodeChars.charAt(63 & n)
    }
    return a
}

// 测试样例
// console.log(base64encode2("123123"))
// console.log(base64encode2("1231234"))
// console.log(SHA1Encrypt('719198916656926dc80e144287853608hqew'))
```