![](https://i.loli.net/2021/08/07/JbP4zaS2TxU6Rkd.png)

> 关注微信公众号：K哥爬虫，持续分享爬虫进阶、JS/安卓逆向等技术干货！

## 声明

**本文章中所有内容仅供学习交流，抓包内容、敏感网址、数据接口均已做脱敏处理，严禁用于商业用途和非法用途，否则由此产生的一切后果均与作者无关，若有侵权，请联系我立即删除！**

## 逆向目标

- 目标：某空气质量监测平台无限 debugger 以及请求数据、返回数据动态加密、解密
- 主页：`aHR0cHM6Ly93d3cuYXFpc3R1ZHkuY24v`
- 接口：`aHR0cHM6Ly93d3cuYXFpc3R1ZHkuY24vYXBpbmV3L2FxaXN0dWR5YXBpLnBocA==`

## 写在前面

这个站点更新频率很高，在K哥之前也已经有很多博主写了该站点的分析文章，近期有读者问请求数据的加密和返回数据的解密，发现其加解密 JS 变成了动态的，以前的那些文章提到的解决思路不太行了，但整体上来说也不是很难，只不过处理起来比较麻烦一点，还有一些小细节需要注意。

在网站的“关于系统”里可以看到，这个站貌似是个人开发者在维护，最早在2013年就有了，在友情赞助列表里，可以看到大多数都是一些环境、测绘、公共卫生相关的大学专业、研究院人员，可以猜测到这些数据对于他们的研究是非常有帮助的，再加上反爬更新频繁，可以看出站长饱受爬虫之苦，K哥也不想给站长添加负担，毕竟这种站点咱们应该支持，让他长久维护下去，**所以本期K哥只分析逻辑和少部分代码，就不放完整代码了，如果有相关专业人士确实需要抓取数据做研究的，可以在公众号后台联系我。**

## 绕过无限 debugger

右键 F12，会提示右键被禁用，不要紧，使用快捷键 `Ctrl+Shift+i` 或者浏览器右上角，更多工具，开发者工具，照样能打开。

![01.png](https://s2.loli.net/2022/01/07/WLe4Qbpfoc8E5zw.png)

### 方法一

打开控制台后会进入第一个无限 debugger，往上跟一个栈，可以看到一个 try-catch 语句，你下断点会发现他会一直走 catch，调用 `setTimeout()` 方法，该方法用于在指定的毫秒数后调用函数或计算表达式，注意上面，是将 debugger 传递给了构造方法 constructor，所以这里我们有两种方法过掉 debugger，Hook 掉 constructor 或 setTimeout 都可以。

![02.png](https://s2.loli.net/2022/01/07/nfgI3SRwBmpD5hW.png)

```javascript
// 两种 Hook 任选一中
// Hook 构造方法
Function.prototype.constructor_ = Function.prototype.constructor;
Function.prototype.constructor = function (a) {
    if(a == "debugger") {
        return function (){};
    }
    return Function.prototype.constructor_(a);
};

// Hook setTimeout
var setTimeout_ = setTimeout
var setTimeout = function (func, time){
    if (func == txsdefwsw){
        return function () {};
    }
    return setTimeout_(func, time)
}
```

然后就来到了第二个无限 debugger，同样跟栈，发现有个 setInterval 定时器和构造方法 constructor，类似的，我们 Hook 掉 constructor 或 setInterval 都可以。注意：定时器这里还检测了窗口高宽，即便是你过了 constructor 或 setInterval，如果不把开发者工具单独拿出来也是不行的，会不断输出“检测到非法调试”。

![03.png](https://s2.loli.net/2022/01/07/6xcyAb4KN1hH8Ji.png)

```javascript
// Hook setInterval
var setInterval_ = setInterval
setInterval = function (func, time){
    if (time == 2000) {
        return function () {};
    }
    return setInterval_(func, time)
}
```

我们观察到，其实这两个无限 debugger 都可以 Hook 构造方法来过掉，所以直接 Fiddler 注入该 Hook 构造方法的代码即可：

![04.png](https://s2.loli.net/2022/01/07/WQaUvjXsB5iPGnu.png)

### 方法二

在我们遇到第二个无限 debugger 的时候，还可以直接跟栈到一个 city_realtime.php 的页面，里面有两个 eval 语句，执行第一个 eval 里面的语句你就会发现正是前面我们在 VM 虚拟机里面看到的 debugger 代码，所以这里理论上可以直接替换掉这个页面，去掉 eval 语句，就不会有无限 debugger 了，但是K哥先告诉你，现在不行了，因为里面有加载了某个 JS，这个 JS 在后面加密解密中会用到，但是这个 JS 是动态的，每10分钟就会改变，我们后面还要通过此页面来获取动态的 JS，所以是不能替换的！这里只是提一下这个思路！

![05.png](https://s2.loli.net/2022/01/07/X7YHEOPfVQR53e9.png)

![06.png](https://s2.loli.net/2022/01/07/2kbVCujhFqNGQyY.png)

### 方法三

当然，这里还有一种最简单的方法，直接右键选择 Never pause here，永不在此处断下即可，同样还需要把开发者工具窗口单独拿出来，不然会一直输出“检测到非法调试”。

![07.png](https://s2.loli.net/2022/01/07/VDCFB9RarhcbIpP.png)

## 抓包分析

我们在实时监控页面，顺便点击查询一个城市，可以看到请求的 Form Data 和返回的数据都是加密的，如下图所示：

![08.png](https://s2.loli.net/2022/01/07/pLVQroWs8E37Hag.png)

## 加密入口

由于是 XHR，所以我们直接跟栈，很容易找到加密的位置：

![09.png](https://s2.loli.net/2022/01/07/nuqNaDlWVtS8iB9.png)

![10.png](https://s2.loli.net/2022/01/07/4t26UgJ93iarVBk.png)

可以看到传递的 data 键值对：`{hXM8NDFHN: p7crXYR}`，键在这个 JS 里是写死的，值是通过一个方法 `pU14VhqrofroULds()` 得到的，这个方法需要传递两个参数，第一个是定值 GETDATA，第二个就是城市名称，我们再跟进看看这个方法是啥：

![11.png](https://s2.loli.net/2022/01/07/iHzgUyvIo4nkLdu.png)

一些 appId、时间戳、城市等参数，做了一些 MD5、base64 的操作，返回的 param 就是我们要的值了。看起来不难，我们再找找返回的加密数据是如何解密的，我们注意到 ajax 请求有个 success 关键字，我们即便是不懂 JS 逻辑，也可以猜到应该是请求成功后的处理操作吧，如下图所示：传进来的 dzJMI 就是返回的加密的数据，经过 `db0HpCYIy97HkHS7RkhUn()` 方法后，就解密成功了：

![12.png](https://s2.loli.net/2022/01/07/6S84phXcPksWdiH.png)

跟进 `db0HpCYIy97HkHS7RkhUn()` 方法，可以看到是 AES+DES+BASE64 解密，传入的密钥 key 和偏移量 iv 都在头部有定义：

![13.png](https://s2.loli.net/2022/01/07/mNxHrR1CShVcU8p.png)

![14.png](https://s2.loli.net/2022/01/07/Rr5QbOx1pctCdfU.png)

## 动态 JS

经过以上分析后，我们加密解密的逻辑都搞定了，但是你多调试一下就会发现，这一个加密解密的 JS 是动态变化的，定义的密钥 key 和偏移量 iv 都是隔段时间就会改变的，如果你在这段代码里下断点，停留时间过长，突然发现断点失效无法断下了，那就是 JS 变了，当前代码已经失效了。

我们随便薅两个不同的 JS 下来（提示：JS 每隔10分钟会变化，后文有详细分析），利用 PyCharm 的文件对比功能（依次选择 View - Compare With）可以总结出以下几个变化的地方（变量名的变化不算）：

1. 开头的8个参数的值：两个 aes key 和 iv，两个 des key 和 iv；

![15.png](https://s2.loli.net/2022/01/08/OsQowlW7K4CSqXr.png)

2. 生成加密的 param 时，appId 是变化的，最后的加密分为 AES、DES 和没有加密，三种情况（这里是最容易忽略的地方，这里没有注意到，请求可能会提示 appId 无效的情况）：

![16.png](https://s2.loli.net/2022/01/08/mqkrlSXN8Vv9ibp.png)

3. 最后发送请求时，data 键值对，其中的键也是变化的：

![17.png](https://s2.loli.net/2022/01/08/PVhbAYTuRdcl4i8.png)

变化的地方我们找到了，那我们怎么获取这个 JS 呢？因为这个 JS 的在 VM 虚拟机里，所以我们还要找到它的源头，是从哪里来的，我们抓包可以看到一个比较特殊的 JS，类似于 encrypt_xxxxxx.js，看这取名就知道不简单，返回的是一段 eval 包裹的代码：

![18.png](https://s2.loli.net/2022/01/08/dC7lp41aO6VMXYe.png)

对于 eval 我们已经很熟悉了，直接去掉 eval，让他执行一下，就可以看到正是我们需要的那段 JS：

![19.png](https://s2.loli.net/2022/01/08/dyBbLt4jHRMA5SV.png)

这里有个小细节，如果你使用控制台，会发现它一直在打印 img 标签，影响我们的输入，这里可以直接跟进去下断点暂时阻止他运行就行了，不需要做其他操作浪费时间：

![20.png](https://s2.loli.net/2022/01/08/4X5SrfYMGUOCZjL.png)

你以为到这里就差不多搞定了？错了，同样的这个 encrypt_xxxxxx.js 也藏有玄机：

1. encrypt_xxxxxx.js 的名称是动态的，后面的 v 值是秒级时间戳，隔600秒，也就是十分钟就会改变，这个 JS 可以在 city_realtime.php 页面找到，还记得我们前面说过的绕过无限 debugger 不能替换此页面吗？我们要通过此页面来获取动态的 JS，所以是不能替换的！

![21.png](https://s2.loli.net/2022/01/08/kfJX7ndYzy1sp5a.png)

![22.png](https://s2.loli.net/2022/01/08/s7k58PMQEXKpOfz.png)

2. encrypt_xxxxxx.js 返回的 JS，并不是所有的执行一遍 eval 就能得到明文代码了，它是 eval 和 base64 相结合的，第一遍都是 eval，但是后面就说不定了，有可能直接出结果，有可能需要 base64，有可能 base64 两遍，有可能两遍 base64 之后还要再 eval，总之，除了第一遍是 eval 以外，后面是否需要 base64 和 eval，以及需要的次数和先后顺序，都是不确定的！举几个例子：

![23.png](https://s2.loli.net/2022/01/08/pdhM3bIo9jxYmJG.png)

![24.png](https://s2.loli.net/2022/01/08/k9gAomCclB3TRfM.png)

![25.png](https://s2.loli.net/2022/01/08/pqSmLvNEYPOUWfz.png)

这里可能有人会问，你怎么看出来那是 base64 呢？很简单，直接在网站页面的控制台里输入 `dswejwehxt`，点击去看这个函数，就是 base64：

![26.png](https://s2.loli.net/2022/01/08/o3XSGcjqpYIa2QN.png)

那么针对 encrypt_xxxxxx.js 内容不确定的情况，我们可以写一个方法，获取到 encrypt_xxxxxx.js 后，需要执行 eval 就执行 eval，需要执行 base64 就执行 base64，直到没有 eval 和 base64 即可，可以分别用字符串 `eval(function` 和 `dswejwehxt(` 来判断是否需要 eval 和 base64（当然也有其他方式，比如 `()` 的个数等），示例代码如下所示：

```python
def get_decrypted_js(encrypted_js_url):
    """
    :param encrypted_js_url: encrypt_xxxxxx.js 的地址
    :return: 解密后的 JS
    """
    decrypted_js = requests.get(url=encrypted_js_url, headers=headers).text
    flag = True
    while flag:
        if "eval(function" in decrypted_js:
            # 需要执行 eval
            print("需要执行 eval！")
            replace_js = decrypted_js.replace("eval(function", "(function")
            decrypted_js = execjs.eval(replace_js)
        elif "dswejwehxt(" in decrypted_js:
            # 需要 base64 解码
            base64_num = decrypted_js.count("dswejwehxt(")
            print("需要 %s 次 base64 解码！" % base64_num)
            decrypted_js = re.findall(r"\('(.*?)'\)", decrypted_js)[0]
            num = 0
            while base64_num > num:
                decrypted_js = base64.b64decode(decrypted_js).decode()
                num += 1
        else:
            # 得到明文
            flag = False
    # print(decrypted_js)
    return decrypted_js
```

## 本地改写

通过以上函数我们就拿到了动态的 JS 了，那么我们可以直接执行拿回来的 JS 吗？当然是不可以的，你可以自己本地执行一下，可以发现里面的 CryptoJS、Base64、hex_md5 都需要补齐才行，所以到这里我们就有两种做法：

1. 拿到解密后的动态 JS 后，动态 JS 和我们自己写的 Base64、hex_md5 等方法组成新的 JS 代码，执行新的 JS 代码拿到参数，这里还需要注意因为里面的其他方法名都是动态的，所以你还得想办法匹配到正确的方法名来调用才行，所以这种方法个人感觉还是稍微有点儿麻烦的；
2. 我们本地自己写一个 JS，拿到解密后的动态 JS 后，把里面的 key、iv、appId、data 键名、param 是否需要 AES 或 DES 加密，这些信息都匹配出来，然后传给我们自己写的 JS，调用我们自己的方法拿到加密结果。

虽然两种方法都很麻烦，但K哥暂时也想不到更好的解决方法了，有比较好的想法的朋友可以留言说一说。

以第二种方法为例，我们本地的 JS 示例（main.js）：

```javascript
var CryptoJS = require("crypto-js");

var BASE64 = {
    encrypt: function (text) {
        return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(text))
    },
    decrypt: function (text) {
        return CryptoJS.enc.Base64.parse(text).toString(CryptoJS.enc.Utf8)
    }
};

var DES = {
    encrypt: function (text, key, iv) {
        var secretkey = (CryptoJS.MD5(key).toString()).substr(0, 16);
        var secretiv = (CryptoJS.MD5(iv).toString()).substr(24, 8);
        secretkey = CryptoJS.enc.Utf8.parse(secretkey);
        secretiv = CryptoJS.enc.Utf8.parse(secretiv);
        var result = CryptoJS.DES.encrypt(text, secretkey, {
            iv: secretiv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return result.toString();
    },
    decrypt: function (text, key, iv) {
        var secretkey = (CryptoJS.MD5(key).toString()).substr(0, 16);
        var secretiv = (CryptoJS.MD5(iv).toString()).substr(24, 8);
        secretkey = CryptoJS.enc.Utf8.parse(secretkey);
        secretiv = CryptoJS.enc.Utf8.parse(secretiv);
        var result = CryptoJS.DES.decrypt(text, secretkey, {
            iv: secretiv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return result.toString(CryptoJS.enc.Utf8);
    }
};

var AES = {
    encrypt: function (text, key, iv) {
        var secretkey = (CryptoJS.MD5(key).toString()).substr(16, 16);
        var secretiv = (CryptoJS.MD5(iv).toString()).substr(0, 16);
        secretkey = CryptoJS.enc.Utf8.parse(secretkey);
        secretiv = CryptoJS.enc.Utf8.parse(secretiv);
        var result = CryptoJS.AES.encrypt(text, secretkey, {
            iv: secretiv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return result.toString();
    },
    decrypt: function (text, key, iv) {
        var secretkey = (CryptoJS.MD5(key).toString()).substr(16, 16);
        var secretiv = (CryptoJS.MD5(iv).toString()).substr(0, 16);
        secretkey = CryptoJS.enc.Utf8.parse(secretkey);
        secretiv = CryptoJS.enc.Utf8.parse(secretiv);
        var result = CryptoJS.AES.decrypt(text, secretkey, {
            iv: secretiv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return result.toString(CryptoJS.enc.Utf8);
    }
};

function getDecryptedData(data, AES_KEY_1, AES_IV_1, DES_KEY_1, DES_IV_1) {
    data = AES.decrypt(data, AES_KEY_1, AES_IV_1);
    data = DES.decrypt(data, DES_KEY_1, DES_IV_1);
    data = BASE64.decrypt(data);
    return data;
}

function ObjectSort(obj) {
    var newObject = {};
    Object.keys(obj).sort().map(function (key) {
        newObject[key] = obj[key];
    });
    return newObject;
}

function getRequestParam(method, obj, appId) {
    var clienttype = 'WEB';
    var timestamp = new Date().getTime()
    var param = {
        appId: appId,
        method: method,
        timestamp: timestamp,
        clienttype: clienttype,
        object: obj,
        secret: CryptoJS.MD5(appId + method + timestamp + clienttype + JSON.stringify(ObjectSort(obj))).toString()
    };
    param = BASE64.encrypt(JSON.stringify(param));
    return param;
}

function getRequestAESParam(requestMethod, requestCity, appId, AES_KEY_2, AES_IV_2){
    var param = getRequestParam(requestMethod, requestCity, appId);
    return AES.encrypt(param, AES_KEY_2, AES_IV_2);
}

function getRequestDESParam(requestMethod, requestCity, appId, DES_KEY_2, DES_IV_2){
    var param = getRequestParam(requestMethod, requestCity, appId);
    return DES.encrypt(param, DES_KEY_2, DES_IV_2);
}
```

我们匹配 JS 里面的各项参数的 Python 代码示例（匹配8个 key、iv 值、appId 和 param 的加密方式）：

```python
def get_key_iv_appid(decrypted_js):
    """
    :param decrypted_js: 解密后的 encrypt_xxxxxx.js
    :return: 请求必须的一些参数
    """
    key_iv = re.findall(r'const.*?"(.*?)";', decrypted_js)
    app_id = re.findall(r"var appId.*?'(.*?)';", decrypted_js)
    request_data_name = re.findall(r"aqistudyapi.php.*?data.*?{(.*?):", decrypted_js, re.DOTALL)

    # 判断 param 是 AES 加密还是 DES 加密还是没有加密
    if "AES.encrypt(param" in decrypted_js:
        request_param_encrypt = "AES"
    elif "DES.encrypt(param" in decrypted_js:
        request_param_encrypt = "DES"
    else:
        request_param_encrypt = "NO"

    key_iv_appid = {
        # key 和 iv 的位置和原来 js 里的是一样的
        "aes_key_1": key_iv[0],
        "aes_iv_1": key_iv[1],
        "aes_key_2": key_iv[2],
        "aes_iv_2": key_iv[3],
        "des_key_1": key_iv[4],
        "des_iv_1": key_iv[5],
        "des_key_2": key_iv[6],
        "des_iv_2": key_iv[7],
        "app_id": app_id[0],
        # 发送请求的 data 的键名
        "request_data_name": request_data_name[0].strip(),
        # 发送请求的 data 值需要哪种加密
        "request_param_encrypt": request_param_encrypt
    }
    # print(key_iv_appid)
    return key_iv_appid
```

我们发送请求以及解密返回值的 Python 代码示例（以北京为例）：

```python
def get_data(key_iv_appid):
    """
    :param key_iv_appid: get_key_iv_appid() 方法返回的值
    """
    request_method = "GETDATA"
    request_city = {"city": "北京"}
    with open('main.js', 'r', encoding='utf-8') as f:
        execjs_ = execjs.compile(f.read())

    # 根据不同加密方式调用不同方法获取请求加密的 param 参数
    request_param_encrypt = key_iv_appid["request_param_encrypt"]
    if request_param_encrypt == "AES":
        param = execjs_.call(
            'getRequestAESParam', request_method, request_city,
            key_iv_appid["app_id"], key_iv_appid["aes_key_2"], key_iv_appid["aes_iv_2"]
        )
    elif request_param_encrypt == "DES":
        param = execjs_.call(
            'getRequestDESParam', request_method, request_city,
            key_iv_appid["app_id"], key_iv_appid["des_key_2"], key_iv_appid["des_iv_2"]
        )
    else:
        param = execjs_.call('getRequestParam', request_method, request_city, key_iv_appid["app_id"])
    data = {
        key_iv_appid["request_data_name"]: param
    }
    response = requests.post(url=aqistudy_api, headers=headers, data=data).text
    # print(response)

    # 对获取的加密数据解密
    decrypted_data = execjs_.call(
        'getDecryptedData', response,
        key_iv_appid["aes_key_1"], key_iv_appid["aes_iv_1"],
        key_iv_appid["des_key_1"], key_iv_appid["des_iv_1"]
    )
    print(json.loads(decrypted_data))
```

运行结果，成功请求并解密返回值：

![27.png](https://s2.loli.net/2022/01/08/MxFWdiokcEjSz1L.png)