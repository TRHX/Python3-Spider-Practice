## 微博

- 目标：微博登录
- 主页：https://weibo.com/
- 接口：https://passport.migu.cn/authn
- 逆向参数：
    - Query String Parameters：
        - `sp: e23c5d62dbf9f8364005f331e487873c70d7ab0e8dd2057c3e66d1ae5d2837ef1dcf86......`
    
## 分析过程

### 登录流程

微博的登录加密参数没有太多，但是登录过程稍微复杂一点，经过了很多次中转，大致说一下登录流程，每一步特殊的参数进行了说明，没有提及的参数表示是定值，直接复制即可：

1.预登陆 ——> 2.获取加密密码 ——> 3.获取 token ——> 4.获取加密后的账号 ——> 5.发送验证码 ——> 6.校验验证码 ——> 7.访问 redirect url ——> 8.访问 crossdomain2 url ——> 9.通过 passport url 登录

#### 1.预登陆

- 请求接口：https://login.sina.com.cn/sso/prelogin.php

- Query String Parameters：
    - `su`：用户名经过 base64 加密得到
    - `_`： 时间戳

- 返回数据数示例：
  
    ```json
    {
        "retcode": 0,
        "servertime": 1627461942,
        "pcid": "gz-1cd535198c0efe850b96944c7945e8fd514b",
        "nonce": "GWBOCL",
        "pubkey": "EB2A38568661887FA180BDDB5CABD5F21C7BFD59C090CB2D245......",
        "rsakv": 1330428213,
        "exectime": 16
    }
    ```

#### 2.获取加密后的密码

通过 Python 或者 JS 来获取加密后的密码，加密分析在后面有分析

#### 3.获取 token

- 请求接口：https://login.sina.com.cn/sso/login.php?client=ssologin.js(v1.4.19)

- Form Data：
    - `su`：用户名经过 base64 加密得到
    - `servertime`：通过第1步预登陆返回的 JSON 里面获取
    - `nonce`：通过第1步预登陆返回的 JSON 里面获取
    - `rsakv`：通过第1步预登陆返回的 JSON 里面获取
    - `sp`：加密后的密码
    - `prelt`：随机值

- 返回数据：token 值，类似于：`2NGFhARzFAFAIp_QwX70Npj8gw4lgj7RbCnByb3RlY3Rpb24.`，如果返回的 token 不是这种，则说明账号或者密码错误。


#### 4.获取加密后的账号

- 请求接口：https://passport.weibo.com/protection/index

- Query String Parameters：
    - `token`: 第3步获取的 token

- 返回数据：加密后的账号，类似于：`75c4744cb405`

#### 5.发送验证码

- 请求接口：https://passport.weibo.com/protection/mobile/sendcode

- Query String Parameters：
    - `token`: 第3步获取的 token
  
- Form Data：
    - `encrypt_mobile`: 第4步获取的加密后的账号

- 返回数据：收到的验证码，类似于：`051534`

#### 6.校验验证码

- 请求接口：https://passport.weibo.com/protection/mobile/confirm

- Query String Parameters：
    - `token`: 第3步获取的 token
  
- Form Data：
    - `encrypt_mobile`: 第四步获取的加密后的账号
    - `code`: 第5步收到的验证码
  
- 返回数据：一个 JSON，其中包含 redirect url

#### 7.访问 redirect url

- 请求接口：第6步返回的 redirect url，类似于：`https://login.sina.com.cn/sso/login.php?entry=weibo&returntype=META......`

- 返回数据：HTML，从中提取 crossdomain2 url

#### 8.访问 crossdomain2 url

- 请求接口：第7步返回的 crossdomain2 url，类似于：`https://login.sina.com.cn/crossdomain2.php?action=login&entry=weibo......`

- 返回数据：HTML，从中提取 passport url

#### 9.通过 passport url 登录

- 请求接口：第8步返回的 passport url，类似于：`https://passport.weibo.com/wbsso/login?ticket=ST-NTcxNjMyMTA2OA%3D%3D-1......`

- 返回数据：包含登录结果，用户 ID 和用户名，类似于：`({"result":true,"userinfo":{"uniqueid":"5716321068","displayname":"Itrhx"}});`

### Query String Parameters

在登录的第3步获取 token 里，请求的 Query String Parameters 包含了一个加密参数 `sp`，这个是加密后的密码，全局搜索此关键字，发现有很多，那么我们尝试搜索 `sp=`，可以在 index.js 里面找到，埋下断点进行调试，可以看到 `sp` 就是 `b` 的值，很明显的 RSA 加密：

![01.png](https://i.loli.net/2021/07/28/giQKka9MuXpPW4J.png)

关键代码有个 if-else 语句，分别埋下断点，经过调试可以看到 `b` 的值在 if 下面生成，有两行关键代码：

```javascript
f.setPublic(me.rsaPubkey, "10001");
b = f.encrypt([me.servertime, me.nonce].join("\t") + "\n" + b)
```

`me.rsaPubkey`、`me.servertime`、`me.nonce` 都是第1步预登陆返回的数据，鼠标移上去可以看到 `f.setPublic` 就是 `br` 函数，`f.encrypt` 就是 `bt` 函数，分别跟进这两个函数，可以看到都在一个匿名函数下面：

![02.png](https://i.loli.net/2021/07/28/nlhfmWd84NiV7oy.png)

直接将整个匿名函数复制下来，去掉最外面的匿名函数，进行本地调试，会提示 `navigator` 未定义，查看复制的源码，里面用到了 `navigator.appName` 和 `navigator.appVersion`，直接定义即可，或者置空即可：

```javascript
navigator = {
    appName: "Netscape",
    appVersion: "5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}
```

继续调试会发现在 `var c = this.doPublic(b);` 提示对象不支持此属性或方法，搜索 `doPublic` 发现有一句 `bq.prototype.doPublic = bs;`，这里直接将其改为 `doPublic = bs;` 即可。

分析整个 RSA 加密逻辑，也可以通过 Python 来实现：

```python
import rsa
import binascii


pre_parameter = {
        "retcode": 0,
        "servertime": 1627461942,
        "pcid": "gz-1cd535198c0efe850b96944c7945e8fd514b",
        "nonce": "GWBOCL",
        "pubkey": "EB2A38568661887FA180BDDB5CABD5F21C7BFD59C090CB2D245......",
        "rsakv": 1330428213,
        "exectime": 16
}

password = '12345678'

public_key = rsa.PublicKey(int(pre_parameter['pubkey'], 16), int('10001', 16))
text = '%s\t%s\n%s' % (pre_parameter['servertime'], pre_parameter['nonce'], password)
encrypted_str = rsa.encrypt(text.encode(), public_key)
encrypted_password = binascii.b2a_hex(encrypted_str).decode()
```

## 加密 JS 剥离

关键 JS 加密代码架构：

```javascript
navigator = {
    appName: "Netscape",
    appVersion: "5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}

function bt(a) {}

function bs(a) {}

function br(a, b) {}

// 此处省略 N 个函数

bl.prototype.nextBytes = bk;
doPublic = bs;
bq.prototype.setPublic = br;
bq.prototype.encrypt = bt;
this.RSAKey = bq


function getEncryptedPassword(me, b) {
    br(me.pubkey, "10001");
    b = bt([me.servertime, me.nonce].join("\t") + "\n" + b);
    return b
}

// 测试样例
// var me = {
//     "retcode": 0,
//     "servertime": 1627283238,
//     "pcid": "gz-a9243276722ed6d4671f21310e2665c92ba4",
//     "nonce": "N0Y3SZ",
//     "pubkey": "EB2A38568661887FA180BDDB5CABD5F21C7BFD59C090CB2D245A87AC253062882729293E5506350508E7F9AA3BB77F4333231490F915F6D63C55FE2F08A49B353F444AD3993CACC02DB784ABBB8E42A9B1BBFFFB38BE18D78E87A0E41B9B8F73A928EE0CCEE1F6739884B9777E4FE9E88A1BBE495927AC4A799B3181D6442443",
//     "rsakv": "1330428213",
//     "exectime": 13
// }
// var b = '12312312312'  // 密码
// console.log(getEncryptedPassword(me, b))
```
