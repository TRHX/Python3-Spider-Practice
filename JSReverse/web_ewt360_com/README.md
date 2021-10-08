## 升学e网通

- 目标：升学e网通登录
- 主页：aHR0cHM6Ly93ZWIuZXd0MzYwLmNvbS9yZWdpc3Rlci8jL2xvZ2lu
- 接口：aHR0cHM6Ly9nYXRld2F5LmV3dDM2MC5jb20vYXBpL2F1dGhjZW50ZXIvdjIvb2F1dGgvbG9naW4vYWNjb3VudA==
- 逆向参数：
    - Request Headers：`sign: 3976F10977FC65F9CB967AEF79E508BD`
    - Request Payload：`password: "A7428361DEF118911783F446A129FFCE"`
  
## 逆向过程

### 抓包分析

来到e网通的登录页面，随便输入一个账号密码登陆，抓包定位到登录接口为 aHR0cHM6Ly9nYXRld2F5LmV3dDM2MC5jb20vYXBpL2F1dGhjZW50ZXIvdjIvb2F1dGgvbG9naW4vYWNjb3VudA==，请求头里，有一个 sign，Payload 里，密码 password 被加密处理了。

![01.png](https://img-blog.csdnimg.cn/68a1a4df25c4451999cb752e99719b8e.png)

### 参数逆向

#### sign

首先来看一下请求头的 sign，尝试直接搜索一下，发现并不是经过某些请求返回的数据，观察一下其他请求，可以发现同样有 sign，而且每次请求的值都不一样：

![02.png](https://img-blog.csdnimg.cn/e612d0d2067648129876576e54407886.png)

由此可以初步判断这个值应该是通过 JS 生成的，全局搜索关键字 `sign:`，可以分别在 request.js、request.ts 两个文件里面看到疑似 sign 赋值的地方，埋下断点调试，成功断下，原理也很简单，时间戳加上一串固定的字符，经过 MD5 加密后再转大写即可。

![03.png](https://img-blog.csdnimg.cn/7ac71aaedebd460aa09fd2ae89f1a90d.png)

使用 Python 实现：

```python
import time
import hashlib


timestamp = str(int(time.time() * 1000))
sign = hashlib.md5((timestamp + 'bdc739ff2dcf').encode(encoding='utf-8')).hexdigest().upper()
print(sign)
```

#### password

password 是明文密码经过加密后得到的值，如果尝试直接去搜索的话，会发现出来的值非常非常多，要想找到准确的值难度巨大：

![04.png](https://img-blog.csdnimg.cn/9c1dcfd1baaa4b3b82ff5abda58f0a6d.png)

可以看到这条请求是 XHR 请求，本次我们使用 XHR 断点的方法来定位具体的加密位置，通过本次案例，我们来学习一下具体是如何跟进调用栈的、如何通过上下文来定位具体的加密位置。

切换到 Network 选项卡，找到登陆请求，鼠标移动到 Initiator 选项卡下的 JS 上，可以看到其调用栈，如果站点的加密方式比较简单，没有太多混淆的话，调用栈里面就可以看到 login、send、post、encrypt 等等之类的关键词，这种情况下就可以直接点进去，比较容易找到加密的地方，但是大多数站点对于函数名、变量名都做了混淆，和本案例一样，调用栈里面显示的都是一些单个或者多个无规则的字母的函数，无法直接定位，此时就需要我们从最后一个函数往前慢慢找。

![05.png](https://img-blog.csdnimg.cn/bca3042b4d7f46a0991de5cdb1b4d1d4.png)

点击进入最后一个函数，即 Y 函数，它位于调用栈的最顶层，表示经过此函数后，浏览器就会发送登录的请求，密码的加密过程已经处理完毕。在此函数埋下断点，可以在右侧的 Call Stack 看到调用栈，从下到上，表示的是点击登陆后，先后调用的函数的执行过程：

![06.png](https://img-blog.csdnimg.cn/de54c8b3df2140c0ad746f00ccf905ed.png)

想要找到具体的加密位置，我们就要依次往前找，挨个函数进行分析，例如往前定位到倒数第二个调用栈，即 o 函数，可以看到传进来的 params 参数里面就包含了已加密的密码信息，这说明加密操作肯定在此函数之前：

![07.png](https://img-blog.csdnimg.cn/7a12926050de420b9893e0f1c284775d.png)

根据这种思路，一步一步往下跟进调用栈，可以看到在 utils.ts 里面执行了一个匿名函数，其中调用了一个 passwordEncrypt 函数，通过函数名就可以看出基本上就是密码加密的函数了：

![08.png](https://img-blog.csdnimg.cn/5974fce317dd4bc98f245aebf7c6574f.png)

在此处埋下断点进行调试，传进来的是明文密码，passwordEncrypt 实际上是调用的 encode.ts 中的 O 函数：

![09.png](https://img-blog.csdnimg.cn/484995eaaac74f658da931a0526cb745.png)

跟进 O 函数，引用了 crypto-js 加密模块，很明显的 AES 加密，本地改写一下就行了。

![10.png](https://img-blog.csdnimg.cn/af401737b8974335bded64c8b1260bb1.png)

本次的案列加密比较简单，但是加密函数隐藏得比较好，需要耐心跟进调用栈，通过直接搜索的话，结果太多，是不太容易定位加密函数的，本次案例中跟进到一个函数后，可以很清楚的看到加密的地方，那么有的站点可能混淆得更加厉害，是看不出来有加密函数的，这种情况下就需要我们注意参数的变化情况，如果在这个调用栈看到的是加密后的参数，在上一个调用栈里面看到的是明文的参数，那么加密的操作必定在这两个调用栈之间，埋下断点，仔细分析即可。

## 加密 JS 剥离

```javascript
CryptoJS = require("crypto-js")

const key = CryptoJS.enc.Utf8.parse("20171109124536982017110912453698");
const iv = CryptoJS.enc.Utf8.parse('2017110912453698'); //十六位十六进制数作为密钥偏移量

function getEncryptedPassword(word) {
    let srcs = CryptoJS.enc.Utf8.parse(word);
    let encrypted = CryptoJS.AES.encrypt(srcs, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
    return encrypted.ciphertext.toString().toUpperCase();
}

// 测试样例
// console.log(getEncryptedPassword("123457"))
```
