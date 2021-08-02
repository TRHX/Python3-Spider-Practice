## 航班管家&人口流动态势大数据

- 目标：航班管家&人口流动态势大数据
- 主页：https://unicom_trip.133.cn/city/?system=cjfcts
- 逆向参数：请求返回的加密数据

## 分析过程

选择城市后可以查看人口流入流出方向的相关信息，包括火车航班路线等，抓包找到接口，可以看到返回的数据是经过加密的：

![01.png](https://i.loli.net/2021/07/14/GWU4AkIKD7rMNLa.png)

加密数据类似于 `mEwNmUifQxxxxxx==` 的结构，由大小写字母组成，最后有两个等号，可以推测这是 base64 加密，尝试使用 base64 解密一下：

![02.png](https://i.loli.net/2021/07/14/c3th5uDjRGXT8pf.png)

```json
{"iv":"0uYc8lBsQQdsZ\/89Hv3LTQ==","value":"QdtoX1WlFKFVRlwcC0oHs\/uPsVQVfZUa4LCjORZtYBc=","mac":"da66a1f1d763d8a3ab0da559b059bfa989fcfad51f6bfae534917d1e0b42a06e"}
```

可以看到出现了 `iv`，`value`，`mac` 字样，证明确实是 base64 加密，看 `value` 里面的值，仍然是加密后的，此时可以全局搜索关键字 `var iv` 或者 `var value`，如果没看出来第一步的 base64 加密，那么可以想到最常见的 `CryptoJS` 加密模块，可以尝试直接搜索 `CryptoJS`，`decrypted` 等关键字，搜索 `var iv` 定位到 index.js：

![03.png](https://i.loli.net/2021/07/14/Ga9IXnDBpTPFHSM.png)

很明显 return 的数据就是解密后的数据，分析这个函数：

![04.png](https://i.loli.net/2021/07/14/ckVfXnJNlEtgiAR.png)

很明显的 CryptoJS AES 加密，其中 `var base = new Base64()` 直接跟进 `Base64` 这个函数，全部 copy 下来即可，CryptoJS 也可以跟进去，全部 copy 下来，但是如果本地有 nodejs 环境的话，直接导入也行。

## 加密 JS 剥离

关键 JS 加密代码架构：

```javascript
var CryptoJS = require('crypto-js')

function Base64() {}

function dataDecode(data) {
    var base = new Base64();
    var d = JSON.parse(base.decode(data));
    var key = 'UVJgCE+OFIff3hK5BT5sPBbGZzjR6FwntjSCwOA9tUQ=';
    var key1 = CryptoJS.enc.Base64.parse(key);
    var iv1 = CryptoJS.enc.Base64.parse(d.iv);
    var decrypted = CryptoJS.AES.decrypt(d.value, key1, {
        iv: iv1,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    var d = decrypted.toString(CryptoJS.enc.Utf8);
    return JSON.parse(d);
}

// 测试样例
// var data = "eyJpdiI6IkdkMlYzXC9tYVwvSzRwcldHN1h2dlFIdz09IiwidmFsdWUiOiJhNUdzSVN3UXJpYllQRW5FQ2RyS0x6OHRVeFZcL1VSeDlNeVl3Q09cL0d1Q3c9IiwibWFjIjoiOTVlMWE0Mjk3MGY1YmIwY2E4MGQxNWI0OThlMjlhYjY0ZTcyMmZkMjg0MGI3YjczODk1ODJiZWU2MWNiNzc5ZCJ9"
// console.log(dataDecode(data))
```
