## 中国联通

- 目标：中国联通网上营业厅登录
- 主页：http://uac.10010.com/
- 接口：https://uac.10010.com/portal/Service/MallLogin
- 逆向参数：
    - cookie：
        - `acw_tc=74d3dd1f16280568261464794e6bae2d5f645436d7a51028264d5d1838;`
        - `unisecid=686E4B43DE538D67945663C56B6F4567;`
        - `ckuuid=3cf7889b8fbe01ffe57093ed50167f84;`
        - `uacverifykey=nqxd8e5114c950350bbb2d5b9e8e534645ehu2`
    - Query String Parameters：
        - `callback: jQuery172049575195279544615_1628065424384`
        - `password: 0107d4bc8294e5192c2a77f23eff24223f42d8cc......`
        - `uvc: mka490056ca227f4866b9c42f8351823757mp4`
  
## 分析过程

### cookie

`acw_tc` 通过访问 `https://uac.10010.com/` 得到：

![01.png](https://i.loli.net/2021/08/04/h4PTklsOtGIbwZK.png)

`unisecid` 通过访问 `https://uac.10010.com/oauth2/genqr` 得到：

![02.png](https://i.loli.net/2021/08/04/RCEKNy7nA9v8e4W.png)

`ckuuid` 通过访问 `https://uac.10010.com/portal/Service/CheckNeedVerify` 得到：

![03.png](https://i.loli.net/2021/08/04/hbzmKX3Cd5Fs7py.png)

`uacverifykey` 通过访问 `https://uac.10010.com/portal/Service/CreateImage` 得到：

![04.png](https://i.loli.net/2021/08/04/D8g7EzkSKFXr4aB.png)

### Query String Parameters

`callback` 前面一段随机数生成，不影响，后面是时间戳，`uvc` 就是 cookies 里面 `uacverifykey` 的值。

全局搜索 `password =`，很明显可以找到 `params.password = RSAUtils.encryptedString` 疑似 RSA 加密的地方：

![05.png](https://i.loli.net/2021/08/04/9VUFBRuiELIy8Hf.png)

跟进这个匿名函数，把包含 RSA 加密的所有代码剥离下来：

![06.png](https://i.loli.net/2021/08/04/SlKQOkdMyG5NELD.png)

本地改写、调试，会提示 `$w` 未定义，直接 `$w={}` 置空即可。

## 加密 JS 剥离

关键 JS 加密代码架构：

```javascript
$w = {}

if (typeof $w.RSAUtils === 'undefined') var RSAUtils = $w.RSAUtils = {};

var biRadixBase = 2;
var biRadixBits = 16;
var bitsPerDigit = biRadixBits;

// 此处省略 N 个函数

RSAUtils.encryptedString = function (key, s) {};

RSAUtils.decryptedString = function (key, s) {};

RSAUtils.setMaxDigits(130);

function getEncryptedPassword(password) {
    var key = RSAUtils.getKeyPair('11', '', '82fd84c464ab864897660ec64bafc32b998b60d5713dd57177820da7cf2409836b4506aa5c2b2943e701b6810df16da0b47e96274765aaf2d72152c5ca76d796756ec8c496cf4365c350c52312368e0c8c5504a14b1122bbde9c0f05627f33eb05ad52ea1f2c8ca7cf6a68e4ee9eee6b45773dc11fe830778202c8209d2ffaab');
    encryptedPassword = RSAUtils.encryptedString(key, password);
    return encryptedPassword
}

// 测试样例
// console.log(getEncryptedPassword("664060"))
```
