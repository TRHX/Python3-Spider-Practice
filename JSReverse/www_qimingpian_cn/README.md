## 企名片&企名科技

- 目标：企名片创业项目
- 主页：https://www.qimingpian.cn/finosda/project/pinvestment
- 接口：https://vipapi.qimingpian.com/DataList/productListVip
- 逆向参数：请求返回的加密数据
  
## 分析过程

企名片 —> 创业服务 —> 创业项目，可以看到有很多创业项目的具体信息，在页面源代码中是找不到这些项目的信息的，抓包分析，XHR 有一条请求，返回的内容包含一个 encrypt_data，很明显这就是加密后的创业项目信息：

![01.png](https://i.loli.net/2021/07/13/yi51hzNS6dMfuPT.png)

全局搜索关键字 encrypt_data，只有在 app.xxxxxxxx.js 里面有六个结果，定位到 10820 行，可以看到这里得到的是加密后的值，那么推测后面就可能要执行解密操作了，点击 Step into next function call，进行下一步的调试：

![02.png](https://i.loli.net/2021/07/13/WiSErBQnU8ZxmlV.png)

一步一步执行，来到 o 函数这里，不难看出有可能是解密的操作，埋下断点进行调试：

![03.png](https://i.loli.net/2021/07/13/DUkZK3oFSnGpXs4.png)

```javascript
function o(t) {
    return JSON.parse(s("5e5062e82f15fe4ca9d24bc5", a.a.decode(t), 0, 0, "012345677890123", 1))
}
```

这段函数里面有两个关键函数，`s` 和 `a.a.decode`，首先跟进这个 `a.a.decode`，埋下断点看一下，直接把这个函数 copy 下来，在本地调试的时候会提示 `f` 和 `c` 两个变量未定义，可以在开发者工具中鼠标放上去或者直接查看右侧的 Closure，可以发现两个都是定值，直接 copy 下来即可：

![04.png](https://i.loli.net/2021/07/13/dw2KrGBP81qkfEA.png)

`s` 函数也同样跟进，直接 copy 下来即可：

![05.png](https://i.loli.net/2021/07/13/y3dBZk8Ms1NuViW.png)

## 加密 JS 剥离

关键 JS 加密代码架构：

```javascript
function s(t, e, i, n, a, s) {}

function decode(t) {
    var f = "/[\t\n\f\r ]/g"
    var c = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
    var e = (t = String(t).replace(f, "")).length;
    // other methods
    // .............
    // other methods
}

function o(t) {
    return s("5e5062e82f15fe4ca9d24bc5", decode(t), 0, 0, "012345677890123", 1)
}

// 测试样例
// var t = "encrypted data: xxxxxxxxxxxxxxxx"
// console.log(o(t))
```
