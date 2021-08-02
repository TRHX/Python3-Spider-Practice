## 全国建筑市场监管公共服务平台

- 目标：住房和城乡建设部&全国建筑市场监管公共服务平台的企业数据
- 主页：http://jzsc.mohurd.gov.cn/data/company
- 接口：http://jzsc.mohurd.gov.cn/api/webApi/dataservice/query/comp/list?pg=%s&pgsz=15&total=450
- 逆向参数：请求返回的加密数据
  
## 分析过程

全国建筑市场监管公共服务平台 —> 数据服务 —> 企业数据，抓包所有企业数据，返回的数据是经过加密的：

![01.png](https://i.loli.net/2021/07/14/JciC6bgWro7mEYR.png)

数据看不出来是什么加密方式，但是一般都是经过 `CryptoJS` 加密模块加密得到的，可以尝试直接搜索 `CryptoJS`，`decrypt` 等关键字，或者搜索加密算法中经常用到的偏移量 `iv`、模式 `mode`、填充方式 `padding` 等，还有一般的 JSON 数据可以搜索 `JSON.parse` 等，这里直接搜索 `JSON.parse`，定位到可疑代码，埋下断点进行调试：

![02.png](https://i.loli.net/2021/07/14/QdEWGMAoCr8uNqV.png)

可以看到 e 就是解密后的数据，`var e = JSON.parse(h(t.data));`，直接跟进 h 函数，可以看到很明显的 AES 加密，在 Python 的引用当中，直接引入 CryptoJS，重写这个函数即可。

![03.png](https://i.loli.net/2021/07/14/BC7xPK38Ezpygou.png)

## 加密 JS 剥离

关键 JS 加密代码重写：

```javascript
// 引用 crypto-js 加密模块
var CryptoJS = require('crypto-js')

function getDecryptedData(t) {
    var m = CryptoJS.enc.Utf8.parse("0123456789ABCDEF"),
        f = CryptoJS.enc.Utf8.parse("jo8j9wGw%6HbxfFn"),
        e = CryptoJS.enc.Hex.parse(t),
        n = CryptoJS.enc.Base64.stringify(e),
        a = CryptoJS.AES.decrypt(n, f, {
            iv: m,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
    }),
        r = a.toString(CryptoJS.enc.Utf8);
    return r.toString()
}

// 测试样例
// var t = '95780ba094xxxxxxxxxx'
// console.log(getDecryptedData(t))
```
