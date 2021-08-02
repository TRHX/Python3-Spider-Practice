## 宁波大学统一身份认证

- 目标：宁波大学登录
- 主页：https://uis.nbu.edu.cn/authserver/login
- 接口：https://uis.nbu.edu.cn/authserver/login
- 逆向参数：
  - Form Data：
    - `password: YuNeyTChgrYr3vwbcE5GIQsaMASBhKo8LIA2kyHSDNUCl1dzjTOj77hTln69AgMHdgmRuutL6D51iTm4Gj82MQtbAz0Hd/sG34/2Jowiklc=`
    - `captchaResponse: zhy8`
    - `lt: LT-3012549-x1SeRFWEq7x2NSXdvge90IuFimwwZW1626081478695-oAye-cas`
    - `dllt: userNamePasswordLogin`
    - `execution: e1s1`
    - `_eventId: submit`
    - `rmShown: 1`
  

## 分析过程

lt, dllt, execution, eventId, rmShown 这五个参数均可在首页源码中得到：

![01.png](https://i.loli.net/2021/07/12/qJAWXY4EQ9dthjf.png)

captchaResponse 是验证码，password 是加密后的密码，抓包分析 password，第 95 行 `_etd2(password.val(), casLoginForm.find("#pwdDefaultEncryptSalt").val())` 不难看出这是对明文密码进行加密的函数，向 `_etd2` 函数中传入两个值：`password.val()` 是明文密码，`casLoginForm.find("#pwdDefaultEncryptSalt").val()` 大致意思是在某个表单中查找 id 为 `pwdDefaultEncryptSalt` 的标签的值，这个值也在首页的源码里：

![02.png](https://i.loli.net/2021/07/12/THWnx1p7b2NQuB6.png)

跟进 `_etd2` 函数，可以看到里面有一个 `encryptAES` 函数，很明显，这是一个 AES 加密算法，

![03.png](https://i.loli.net/2021/07/12/Ms83pWEBnPDlRvT.png)

继续跟进 `encryptAES` 函数，里面又有一个 `_gas` 函数，可以看到 `_gas` 函数里面设置了 AES 加密的 iv 偏移量，CBC 模式，Pkcs7 填充方式：

![04.png](https://i.loli.net/2021/07/12/NtGk9CbSRgFTwZe.png)

有了大致的加密流程，可以 `var CryptoJS = require('crypto-js')` 直接引入 crypto-js 加密模块还原加密流程，也可以尝试使用 Python 来还原这个 AES 加密算法，为了简便也可以直接复制网站的 JS 代码直接使用。

## 加密 JS 剥离

关键 JS 加密代码架构：

```javascript
var CryptoJS = CryptoJS || function(u, p) {}(Math);

(function() {})();

(function(u) {})(Math);

(function() {})();

CryptoJS.lib.Cipher || function(u) {}();

(function() {})();

function _gas(data, key0, iv0) {}

function encryptAES(data, _p1) {}

function _ep(p0, p1) {}

var $_chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
var _chars_len = $_chars.length;

function _rds(len) {}

// function _etd2(_p0, _p1) {
//     try {
//         var _p2 = encryptAES(_p0, _p1);
//         $("#casLoginForm").find("#passwordEncrypt").val(_p2);
//     } catch (e) {
//         $("#casLoginForm").find("#passwordEncrypt").val(_p0);
//     }
// }

function getEncryptedPassword(password, pwdDefaultEncryptSalt) {
    return encryptAES(password, pwdDefaultEncryptSalt);
}

// 测试样例
// console.log(getEncryptedPassword("wqwqwq", "Xv1uDlrzgUucsrfZ"))
```