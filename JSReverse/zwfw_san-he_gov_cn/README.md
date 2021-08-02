## 三河市政务服务网

- 目标：三河市政务服务网 —> 政民互动 —> 我要咨询
- 主页：http://zwfw.san-he.gov.cn/icity/icity/guestbook/interact
- 接口：http://zwfw.san-he.gov.cn/icity/api-v2/app.icity.guestbook.WriteCmd/getList
- 逆向参数：
  - Request Headers：`Cookie: ICITYSession=fe7c34e21abd46f58555124c64713513`
  - Query String Parameters：`s=eb84531626075111111&t=4071_e18666_1626075203000`
  - Request Payload：`{"start":0,"limit":7,"TYPE@=":"2","OPEN@=":"1"}`
  
## 分析过程

Cookie 在 Response Headers —> Set-Cookie 里可以看到是一样的，那么使用 get 方法请求主页，在 response 里面直接取 Cookie 即可

Request Payload 的参数经过观察可以发现 start 每一页 +7，其他参数不变

Query String Parameters 的两个参数 s 和 t，是经过 JS 加密后得到的，抓包分析：

打开开发者工具，有两个无限 debugger，直接右键 Never pause here 跳过：

![01.png](https://i.loli.net/2021/07/12/ZWfnKtLzg3e1buI.png)

全局搜索 s 这个参数，由于 s 太多，可以尝试搜索 `var s`，可以找到一个 `var sig` 的地方，这段函数后面有两个比较明显的语句：`curUrl += "?s=" + sig;` `curUrl += "&t=" + t;`，不难看出是 URL 拼接语句，s 参数就是 sig，埋下断点，可以看到正是我们要找的参数：

![02.png](https://i.loli.net/2021/07/12/9ZtPGwTldUWSLxO.png)

这段函数里面有一个 `__signature` 参数，全局搜索发现这个值在主页的 HTML 里面可以找到，直接正则表达式提取出来即可。

![03.png](https://i.loli.net/2021/07/12/qACX9OigGh5nVdH.png)

## 加密 JS 剥离

```javascript
isNotNull = function (obj) {
    if (obj === undefined || obj === null || obj == "null" || obj === "" || obj == "undefined")
        return false;
    return true;
};

function getDecryptedParameters(__signature) {
    var sig = "";
    var chars = "0123456789abcdef";
    if (!isNotNull(__signature)) {
        var curTime = parseInt(Math.random() * (9999 - 1000 + 1) + 1000) + "" + Date.parse(new Date());
        sig = chars.charAt(parseInt(Math.random() * (15 - 15 + 1) + 10)) + chars.charAt(curTime.length) + "" + curTime;
    } else {
        sig = __signature;
    }

    var key = "";
    var keyIndex = -1;
    for (var i = 0; i < 6; i++) {
        var c = sig.charAt(keyIndex + 1);
        key += c;
        keyIndex = chars.indexOf(c);
        if (keyIndex < 0 || keyIndex >= sig.length) {
            keyIndex = i;
        }
    }

    var timestamp = parseInt(Math.random() * (9999 - 1000 + 1) + 1000) + "_" + key + "_" + Date.parse(new Date());
    var t = timestamp;
    //LEx.azdg.encrypt(timestamp,key);
    t = t.replace(/\+/g, "_");
    return {"s": sig, "t": t};
}

// 测试样例
// console.log(getDecryptedParameters("c988121626057020055"))
```
