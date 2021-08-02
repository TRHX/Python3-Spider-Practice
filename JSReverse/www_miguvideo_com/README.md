## 咪咕视频

- 目标：咪咕视频登录
- 主页：https://www.miguvideo.com/mgs/website/prd/sportsHomePage.html
- 接口：https://passport.migu.cn/authn
- 逆向参数：
    - Form Data：
        - `loginID: 3f9a592730094ab984453e3ef8edbfe93fa460f6704bf755619d4aa6eebe9......`
        - `enpassword: 2cbe00083b919c61446cb8f78db8486f5bb61dd691d70671ec3276dea1......`
        - `fingerPrint: 66b6c6c4bc865dcb7f8c430df89aab87292c95e656fbc6e2ea46e618a......`
        - `fingerPrintDetail: 1fef450c6bbe5b2b815dfcf1a964275cbcab28f8255c981659f......`
  
## 分析过程

### loginID

直接全局搜索，可以发现除了主页源码里面有 `loginID` 关键字以外，没有任何线索：

![01.png](https://i.loli.net/2021/07/24/FnTNUZlHLGxXvze.png)

这种情况下，我们尝试搜索元素的 class 值，即 `J_RsaAccout` 和 `J_RsaPass`，可以看到在 loginPage.js 里面可以找到，分别在这两个地方埋下断点，重新执行登录操作进行调试，可以发现在 `J_RsaAccout` 这里被断下，此时 `d` 的值就是 `loginID` 的值：

![02.png](https://i.loli.net/2021/07/24/PwT4XvFg3nZibDo.png)

剥离出关键代码：

```javascript
var b = $(this)
  , c = new r.RSAKey;
c.setPublic(a.result.modulus, a.result.publicExponent);
var d = c.encrypt(b.val());
```

`b.val()` 就是明文手机号，`a` 这个对象不知道是什么，尝试搜一下 `a.result.modulus` 的值，可以发现其实就是通过 post 请求 https://passport.migu.cn/password/publickey 返回的值：

![03.png](https://i.loli.net/2021/07/24/JXBzv6bNsL3ouqO.png)

往上看还有一个 `c` 的值，鼠标放到 `r.RSAKey` 上，跟进 `function db()` 这个函数，搜索一下 `RSAKey` 关键字，可以看到一条语句：

![04.png](https://i.loli.net/2021/07/24/Q8YVTHfeCiroAt9.png)

```javascript
c.exports = {
    RSAKey: db
}
```

这里用到了 JavaScript 中的 exports，可以选择性地给其他模块暴露（提供）自己的属性和方法，供其他模块使用，我们剥离下来后可以直接改写成 `RSAKey=db`，代码的剥离范围，将 `RSAKey: db` 包含在内的整个函数都 copy 下来进行本地调试：

![04.png](https://i.loli.net/2021/07/24/xEZI6sjqUVJnwFM.png)

在本地调试的过程中，会遇到两个问题 `navigator` 和 `windows` 未定义，那么直接将这两个对象置空即可，不影响程序的运行：`windows={}` `navigator={}`，事实上，我们也可以查看一下在源码中，这两个具体用到的值是什么，在 console 打印出来复制，然后定义即可：

![05.png](https://i.loli.net/2021/07/24/g1sSEvZUfHRlxtc.png)

```javascript
navigator = {
    appCodeName: "Mozilla",
    appName: "Netscape",
    appVersion: "5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}
```

### enpassword

全局搜索 `enpassword`，和 `loginID` 类似，，也是只有首页源码有关键字：

![06.png](https://i.loli.net/2021/07/24/Cs2gbkiq3j1B7Sc.png)

同样的方法，搜索元素的 class 值，即 `J_RsaPsd`，同样的在 loginPage.js 里面可以找到三个地方，分别埋下断点，重新登陆调试，可以发现在第一个位置被断下：

![07.png](https://i.loli.net/2021/07/24/6Sz4vHns3EGgXxD.png)

```javascript
var b = $(this)
  , c = new r.RSAKey;
c.setPublic(a.result.modulus, a.result.publicExponent);
var d = c.encrypt(b.val());
```

分析关键代码，和 `loginID` 的加密过程一模一样，唯一不同的是这里的 `b.val()` 就是明文密码。

### fingerPrint & fingerPrintDetail

同样是全局搜索 `fingerPrint` 和 `fingerPrintDetail` 关键字，同样也只在首页源码中出现：

![08.png](https://i.loli.net/2021/07/24/wHsaYTZL1MGtbp3.png)

搜索元素的 class 值，即 `J_FingerPrint` 和 `J_FingerPrintDetail`，可以发现基本上是挨在一起的，可疑的地方有6个，我们直接全部埋下断点，然后重新登陆调试，可以发现在第一个断点处断下：

![09.png](https://i.loli.net/2021/07/24/VkP5nD7NlRbFoew.png)

```javascript
var b = q.page.rsaFingerprint(a.result.modulus, a.result.publicExponent);
```

可以发现 b 这个对象有 `details` 和 `result` 两个值，就是我们最后想要的，`a.result.modulus`、`a.result.publicExponent` 和前面的一样，不再分析，跟进 `q.page.rsaFingerprint` 这个方法，可以看到最后 return 回来的两个值就是我们要的结果：

![10.png](https://i.loli.net/2021/07/24/waCyxt1EZpSusIj.png)

分析这段关键代码，可以发现只要找到 `$.fingerprint` 的值就行了，我们搜索一下这个值，很容易在这段代码的上面就找到，尝试打印一下 `$.fingerprint.details` 和 `$.fingerprint.result`，可以看到 `$.fingerprint.details` 是一些 UserAgent 信息：

![11.png](https://i.loli.net/2021/07/24/XyAQalrInYb2831.png)

分析 `saveFingerprint` 这个函数，很明显是生成 `$.fingerprint` 的，`details` 的值是 `b`, `result` 的值是 `a`，`a` 又等于 `c`，`c` 又是经过 `Fingerprint2` 这个函数得来的，跟进这个函数看一下：

![12.png](https://i.loli.net/2021/07/26/pCqtKDVg3LsHTyG.png)

这个函数很长，往下看，可以看到一串类似 ` c = this.userAgentKey(c),` 的语句，可以大致看出是在设置 UserAgent 信息，即 `$.fingerprint.details` 的值，再往下可以看到一下语句：

```javascript
var e = b.x64hash128(d.join("~~~"), 31);
return a(e, c.data)
```

很明显可能是一个加密算法，埋下断点，刷新一下网页（UA 信息有可能在访问网页的时候就被提取），可以看到在此处断下，而这个 `e` 的值刚好就是 `$.fingerprint.result` 的值。

PS：怎么看出来要在这里下断点的呢？分析这个函数可以看到，往后就是一些获取 UA、语言、时间戳等等各项信息了（通过函数名称看得出来），往前大概就是在设置这些值，而且这里还有加密函数，所以推断这里可能是生成 `$.fingerprint.result` 值的地方！

![13.png](https://i.loli.net/2021/07/26/6STdHmNWntMAxhq.png)

总结下来就是，`$.fingerprint.details` 是一些 UA、语言等等之类的东西，`$.fingerprint.result` 是由 `$.fingerprint.details` 加密后得到的一个字符串，那么只要 `$.fingerprint.details` 不变，`$.fingerprint.result` 的值也是不会变的，所以可以直接将这两个值写死即可！

有了这两个值，直接定义后，执行前面的 `rsaFingerprint` 函数，就可以得到 fingerPrint 和 fingerPrintDetail 两个的值了。

## 注意事项

`window` 和 `navigator` 需要定义，可以为空。

`$.fingerprint` 的值直接定义即可，注意 `details` 和 `result` 的对应关系。

`loginID` 和 `enpassword` 参数生成过程中，以下语句需要改写：
- `c.exports = {RSAKey: db}` 语句要改写成 `RSAKey=db`
- `c = new r.RSAKey;` 语句要改写成 `c = new RSAKey;`

## 加密 JS 剥离

关键 JS 加密代码架构：

```javascript
window = {}

navigator = {
    appCodeName: "Mozilla",
    appName: "Netscape",
    appVersion: "5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}

$.fingerprint = {
    "details": "{\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.12\",\"language\":\"zh\",\"color_depth\":\"24\",\"pixel_ratio\":\"1\",\"hardware_concurrency\":\"8\",\"resolution\":\"1920,1080\",\"available_resolution\":\"1920,1040\",\"timezone_offset\":\"-480\",\"session_storage\":\"1\",\"local_storage\":\"1\",\"indexed_db\":\"1\",\"open_database\":\"1\",\"cpu_class\":\"unknown\",\"navigator_platform\":\"Win32\",\"do_not_track\":\"unknown\",\"regular_plugins\":\"Chrome PDF Plugin::Portable Document Format::application/x-google-chrome-pdf~pdf,Chrome PDF Viewer::\",\"webgl_vendor\":\"Google Inc. (Intel)~ANGLE (Intel, Intel(R) HD Graphics 4000 Direct3D11 vs_5_0 ps_5_0, D3D11-10.18.10\",\"adblock\":\"false\",\"has_lied_languages\":\"false\",\"has_lied_resolution\":\"false\",\"has_lied_os\":\"false\",\"has_lied_browser\":\"false\",\"touch_support\":\"0,false,false\",\"js_fonts\":\"Arial,Arial Black,Arial Narrow,Book Antiqua,Bookman Old Style,Calibri,Cambria,Cambria Math,Century,C\"}",
    "result": "64c733448a723f4d7f41df39f0035749"
}

function d(a, b, c){}

function e(){}

function f(){}

// 此处省略 N 个函数

ab.prototype.nextBytes = _,
db.prototype.doPublic = fb,
db.prototype.setPublic = eb,
db.prototype.encrypt = gb,
RSAKey = db

function rsaFingerprint(a, b) {
    if (!$.fingerprint)
        return {
            details: "",
            result: ""
        };
    var c = $.fingerprint.details
        , d = $.fingerprint.result
        , e = c.length
        , f = ""
        , g = new RSAKey;
    g.setPublic(a, b);
    for (var h = g.encrypt(d), i = 0; e > i; i += 117)
        f += g.encrypt(c.substr(i, 117));
    return {
        details: f,
        result: h
    }
}


function getLoginID(publicKey, username) {
    c = new RSAKey;
    c.setPublic(publicKey.result.modulus, publicKey.result.publicExponent);
    var d = c.encrypt(username);
    return d
}

function getEncryptedPassword(publicKey, password) {
    c = new RSAKey;
    c.setPublic(publicKey.result.modulus, publicKey.result.publicExponent);
    var d = c.encrypt(password);
    return d
}

function getFingerPrint(publicKey) {
    var b = rsaFingerprint(publicKey.result.modulus, publicKey.result.publicExponent);
    return b
}

// 测试样例
// var publicKey = {
//     "status": 2000,
//     "message": "",
//     "header": {},
//     "result": {
//         "publicExponent": "010001",
//         "modulus": "00833c4af965ff7a8409f8b5d5a83d87f2f19d7c1eb40dc59a98d2346cbb145046b2c6facc25b5cc363443f0f7ebd9524b7c1e1917bf7d849212339f6c1d3711b115ecb20f0c89fc2182a985ea28cbb4adf6a321ff7e715ba9b8d7261d1c140485df3b705247a70c28c9068caabbedbf9510dada6d13d99e57642b853a73406817"
//     }
// }
//
// console.log(getLoginID(publicKey, "15633443344"))
// console.log(getEncryptedPassword(publicKey, "123456789"))
// console.log(getFingerPrint(publicKey))
```
