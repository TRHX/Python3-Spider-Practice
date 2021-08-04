## 37网游

- 目标：37网游登录
- 主页：https://www.37.com/
- 接口：https://my.37.com/api/login.php
- 逆向参数：
  - Query String Parameters：
    - `password: SlVEOThrcjgzNDNjaUYxOTQzNDM0eVM=`

## 分析过程

全局搜索 `password =`，在 sq.login2015.js 文件里可以看到 ` h.password = td(f)` 疑似密码加密的地方，埋下断点进行调试：

![01.png](https://i.loli.net/2021/08/03/wL5WQDkGPUldNIc.png)

跟进 `td` 函数，可以看到是用到了一个自写的 rsa 加密，直接复制下来使用即可：

![02.png](https://i.loli.net/2021/08/03/96qMXVte3Zhogns.png)

## 加密 JS 剥离

```javascript
var ch = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function __rsa(str) {
    var out, i, len;
    var c1, c2, c3;
    len = str.length;
    i = 0;
    out = "";
    while (i < len) {
        c1 = str.charCodeAt(i++) & 0xff;
        if (i == len) {
            out += ch.charAt(c1 >> 2);
            out += ch.charAt((c1 & 0x3) << 4);
            out += "==";
            break
        }
        c2 = str.charCodeAt(i++);
        if (i == len) {
            out += ch.charAt(c1 >> 2);
            out += ch.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
            out += ch.charAt((c2 & 0xF) << 2);
            out += "=";
            break
        }
        c3 = str.charCodeAt(i++);
        out += ch.charAt(c1 >> 2);
        out += ch.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
        out += ch.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
        out += ch.charAt(c3 & 0x3F)
    }
    return out
}

function getEncryptedPassword(a) {
    var maxPos = ch.length - 2
      , w = [];
    for (i = 0; i < 15; i++) {
        w.push(ch.charAt(Math.floor(Math.random() * maxPos)));
        if (i === 7) {
            w.push(a.substr(0, 3))
        }
        if (i === 12) {
            w.push(a.substr(3))
        }
    }
    return __rsa(w.join(""))
}

// 测试样例
// console.log(getEncryptedPassword("34343434"))
```