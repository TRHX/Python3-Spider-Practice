![](https://i.loli.net/2021/08/07/JbP4zaS2TxU6Rkd.png)

> 关注微信公众号：K哥爬虫，持续分享爬虫进阶、JS/安卓逆向等技术干货！

## 声明

**本文章中所有内容仅供学习交流，抓包内容、敏感网址、数据接口均已做脱敏处理，严禁用于商业用途和非法用途，否则由此产生的一切后果均与作者无关，若有侵权，请联系我立即删除！**

## 逆向目标

- 目标：智慧树扫码登录，接口使用了 WebSocket 通信协议
- 主页：`aHR0cHM6Ly9wYXNzcG9ydC56aGlodWlzaHUuY29tL2xvZ2luI3FyQ29kZUxvZ2lu`

## WebSocket 简介

WebSocket 是一种在单个 TCP 连接上进行全双工通信的协议，WebSocket 使得客户端和服务器之间的数据交换变得更加简单。在 WebSocket API 中，浏览器和服务器只需要完成一次握手，两者之间就直接可以创建持久性的连接，并进行双向数据传输。

WebSocket 协议简称为 WS 或者 WSS（WebSocket Secure），其发送请求的 URL 以 `ws://` 或者 `wss://` 开头，WSS 是 WS 的加密版本，类似于 HTTP 与 HTTPS。

WebSocket 协议的最大特点就是：服务器可以主动向客户端推送信息，客户端也可以主动向服务器发送信息，是真正的双向平等对话，属于服务器推送技术的一种。与 HTTP 的对比如下图所示：

![01.png](https://i.loli.net/2021/11/29/3Tma8prA5qO96tg.png)

## 抓包分析

来到智慧树的扫码登录页面，抓包选中 WS，用来筛选 WebSocket 请求，如下图所示：

![02.png](https://i.loli.net/2021/11/29/pUzVP4tBmDXlra7.png)

其中有一些比较特别的参数，是 HTTP/ HTTPS 请求中没有的：

- `Upgrade: websocket`：表明这是 WebSocket 类型请求；
- `Sec-WebSocket-Version`：告诉服务器所使用的 Websocket Draft（协议版本），必须是 13；
- `Sec-WebSocket-Extensions`：协议扩展，某类协议可能支持多个扩展，通过它可以实现协议增强；
- `Sec-WebSocket-Key`：是 WebSocket 客户端发送的一个 base64 编码的密文，是浏览器随机生成的，要求服务端必须返回一个对应加密的 `Sec-WebSocket-Accept` 应答，否则客户端会抛出 `Error during WebSocket handshake` 错误，并关闭连接。

我们先扫码登录一遍，再选择 Messages 选项卡，可以看到有一些数据交互，其中绿色的箭头是客户端发送给服务器的数据，红色箭头是服务器响应返回给客户端的数据，如下图所示：

![03.png](https://i.loli.net/2021/11/29/zWKv9IwtqHo5LNS.png)

我们观察一下整个交互过程，当我们打开二维码页面后，也就是二维码加载出来的同时，WebSocket 连接就建立了，每隔8秒左右，客户端就主动发送一串字符串，服务端也返回相同的字符串，只不过是字典格式，当我们扫码成功时，服务端就返回扫码成功的信息，当我们点击登陆时，客户端又会返回扫码结果，如果成功，就有一个一次性密码 `oncePassword` 和一个 `uuid`，这两个参数肯定在后续的请求中会用到的。如果长时间不扫码的话，过段时间就会返回二维码已失效的信息，每隔8秒发送一次消息，正是为了保持连接以及获取二维码状态消息。

那么到这里就出现了两个问题：

1. 在来回交互发送的那串字符串，是怎么得来的？

2. 在 Python 中应该如何实现 WebSocket 请求？
3. 如何实现客户端每隔 8 秒发送一次数据的同时，实时接收服务端的信息？（观察请求扫码结果实时返回的，所以不能每隔 8 秒才接收一次）

## 参数获取

首先解决第一个问题，客户端发送的那串字符串是怎么来的，这里寻找加密字符串的方式和 HTTP/HTTPS 请求是一样的，在本例中，我们可以直接搜索这个字符串，发现是通过一个接口传过来的，其中 img 就是二维码图片的 base64 值，qrToken 就是客户端发送的那串字符串，如下图所示：

![04.png](https://i.loli.net/2021/11/29/F1usWIB5tUwbRhm.png)

这里需要注意的是，并不是所有的 WebSocket 请求都是如此的简单的，有的客户端发送的数据是 Binary Message（二进制数据）、或者更复杂的加密参数，直接搜索无法获取，针对这种情况，我们也有解决方法：

1. 已知创建 WebSocket 对象的语句为：`var Socket = new WebSocket(url, [protocol] );`，所以我们可以搜索 `new WebSocket` 定位到建立请求的位置。

2. 已知一个 WebSocket 对象有以下相关事件，我们可以搜索对应事件处理程序代码来定位：

| 事件    | 事件处理程序     | 描述                       |
| :------ | :--------------- | :------------------------- |
| open    | Socket.onopen    | 连接建立时触发             |
| message | Socket.onmessage | 客户端接收服务端数据时触发 |
| error   | Socket.onerror   | 通信发生错误时触发         |
| close   | Socket.onclose   | 连接关闭时触发             |

3. 已知一个 WebSocket 对象有以下相关方法，我们可以搜索对应方法来定位：

| 方法           | 描述             |
| :------------- | :--------------- |
| Socket.send()  | 使用连接发送数据 |
| Socket.close() | 关闭连接         |

## Python 实现 WebSocket 请求

接着前面说，第二个问题，在 Python 中应该如何实现 WebSocket 请求？Python 库中用于连接 WebSocket 的有很多，比较常用、稳定的有 [websocket-client](https://github.com/websocket-client/websocket-client)（非异步）、[websockets](https://github.com/aaugustin/websockets)（异步）、[aiowebsocket](https://github.com/asyncins/aiowebsocket)（异步）。在本案例中使用 websocket-client，这里还要注意第三个问题，对于客户端来说，要每隔 8 秒发送一次数据，对于服务端，我们需要实时接收服务端的信息，可以观察请求，扫码的结果是实时返回的，如果我们也每隔 8 秒才接收一次数据的话，有可能会丢失数据，而且也会使得整个程序的响应也不及时，效率变低。

在 websocket-client 官方文档中给我们提供了一个长连接的 demo，它实现了连续发送三次数据，并实时监听服务端返回的数据，其中的 `websocket.enableTrace(True)` 表示是否显示连接详细信息：

```python
import websocket
import _thread
import time


def on_message(ws, message):
    print(message)


def on_error(ws, error):
    print(error)


def on_close(ws, close_status_code, close_msg):
    print("### closed ###")


def on_open(ws):
    def run(*args):
        for i in range(3):
            time.sleep(1)
            ws.send("Hello %d" % i)
        time.sleep(1)
        ws.close()
        print("thread terminating...")
    _thread.start_new_thread(run, ())


if __name__ == "__main__":
    websocket.enableTrace(True)
    ws = websocket.WebSocketApp(
        "ws://echo.websocket.org/", on_open=on_open,
        on_message=on_message, on_error=on_error, on_close=on_close
    )

    ws.run_forever()
```

我们将其适当改造一下，客户端在 run 方法里，依然是每隔 8 秒发送一次 qr_token，实时接收服务端的消息，当“扫码成功”字样出现在消息里时，将得到的 `oncePassword` 和 `uuid` 存起来，然后关闭连接，逻辑代码如下所示，后续只要将二维码的获取逻辑接入就行了。（已脱敏处理，不能直接运行）

```python
import json
import time
import _thread
import websocket


web_socket_url = "wss://appcomm-user.脱敏处理.com/app-commserv-user/websocket?qrToken=%s"
qr_token = "ca6e6cfb70de4f2f915b968aefcad404"
once_password = ""
uuid = ""


def wss_on_message(ws, message):
    print("=============== [message] ===============")
    message = json.loads(message)
    print(message)
    if "扫码成功" in message["msg"]:
        global once_password, uuid
        once_password = message["oncePassword"]
        uuid = message["uuid"]
        ws.close()


def wss_on_error(ws, error):
    print("=============== [error] ===============")
    print(error)
    ws.close()


def wss_on_close(ws, close_status_code, close_msg):
    print("=============== [closed] ===============")
    print(close_status_code)
    print(close_msg)


def wss_on_open(ws):
    def run(*args):
        while True:
            ws.send(qr_token)
            time.sleep(8)
    _thread.start_new_thread(run, (qr_token,))


def wss():
    # websocket.enableTrace(True)  # 是否显示连接详细信息
    ws = websocket.WebSocketApp(
        web_socket_url % qr_token, on_open=wss_on_open,
        on_message=wss_on_message, on_error=wss_on_error,
        on_close=wss_on_close
    )
    ws.run_forever()
```

## 实现扫码登录

最重要的 WebSocket 请求部分已经解决了，扫码拿到 `oncePassword` 和 `uuid` 后，后续的处理步骤就比较简单了，现在来理一下完整的步骤：

1. 请求首页，第一次获取 cookie，包含：INGRESSCOOKIE、JSESSIONID、SERVERID、acw_tc；
2. 请求获取二维码接口，得到二维码的 base64 值和 qrToken；
3. 建立 WebSocket 连接，扫描二维码，获取一次性密码 oncePassword 和 uuid（好像没什么用）；
4. 请求一个登录接口，302 重定向，需要携带一次性密码，第二次获取 cookie，包含：CASLOGC、CASTGC，同时更新 SERVERID；
5. 请求第 4 步 302 重定向地址，第三次获取 cookie，包含：SESSION；
6. 携带完整 cookie，请求用户信息接口，获取真实用户名等信息。

实际上 WebSocket 连接结束后，有很多请求，看起来都比较可以，但是经过 K 哥测试，只有两个重定向比较有用，抓包如下：

![05.png](https://i.loli.net/2021/11/29/NMypcTUAW5gEXmZ.png)

## 完整代码

GitHub 关注 K 哥爬虫，持续分享爬虫相关代码！欢迎 star ！https://github.com/kgepachong/

**以下只演示部分关键代码，不能直接运行！** 完整代码仓库地址：https://github.com/kgepachong/crawler/

### Python 登录代码

```python
import time
import json
import base64
import _thread
import requests
import websocket
from PIL import Image


web_socket_url = "脱敏处理，完整代码关注 GitHub：https://github.com/kgepachong/crawler"
get_login_qr_img_url = "脱敏处理，完整代码关注 GitHub：https://github.com/kgepachong/crawler"
login_url = "脱敏处理，完整代码关注 GitHub：https://github.com/kgepachong/crawler"
user_info_url = "脱敏处理，完整代码关注 GitHub：https://github.com/kgepachong/crawler"

headers = {
    "Host": "脱敏处理，完整代码关注 GitHub：https://github.com/kgepachong/crawler",
    "Pragma": "no-cache",
    "Referer": "脱敏处理，完整代码关注 GitHub：https://github.com/kgepachong/crawler",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36"
}

qr_token = ""
once_password = ""
uuid = ""
cookie = {}


def get_cookies_first():
    response = requests.get(url=login_url, headers=headers)
    global cookie
    cookie = response.cookies.get_dict()


def get_login_qr_img():
    response = requests.get(url=get_login_qr_img_url, headers=headers, cookies=cookie).json()
    qr_img = response["img"]
    global qr_token
    qr_token = response["qrToken"]
    with open('code.png', 'wb') as f:
        f.write(base64.b64decode(qr_img))
    image = Image.open('code.png')
    image.show()
    print("请扫描验证码! ")


def wss_on_message(ws, message):
    print("=============== [message] ===============")
    message = json.loads(message)
    print(message)
    if "扫码成功" in message["msg"]:
        global once_password, uuid
        once_password = message["oncePassword"]
        uuid = message["uuid"]
        ws.close()


def wss_on_error(ws, error):
    print("=============== [error] ===============")
    print(error)
    ws.close()


def wss_on_close(ws, close_status_code, close_msg):
    print("=============== [closed] ===============")
    print(close_status_code)
    print(close_msg)


def wss_on_open(ws):
    def run(*args):
        while True:
            ws.send(qr_token)
            time.sleep(8)
    _thread.start_new_thread(run, (qr_token,))


def wss():
    # websocket.enableTrace(True)  # 是否显示连接详细信息
    ws = websocket.WebSocketApp(
        web_socket_url % qr_token, on_open=wss_on_open,
        on_message=wss_on_message, on_error=wss_on_error,
        on_close=wss_on_close
    )
    ws.run_forever()


def get_cookie_second():
    global cookie
    params = {
        "pwd": once_password,
        "service": "脱敏处理，完整代码关注 GitHub：https://github.com/kgepachong/crawler"
    }
    headers["Host"] = "脱敏处理，完整代码关注 GitHub：https://github.com/kgepachong/crawler"
    headers["Referer"] = "脱敏处理，完整代码关注 GitHub：https://github.com/kgepachong/crawler"
    response = requests.get(url=login_url, params=params, headers=headers, cookies=cookie, allow_redirects=False)
    cookie.update(response.cookies.get_dict())
    location = response.headers.get("Location")
    return location


def get_cookie_third(location):
    global cookie
    headers["Host"] = "脱敏处理，完整代码关注 GitHub：https://github.com/kgepachong/crawler"
    headers["Referer"] = "脱敏处理，完整代码关注 GitHub：https://github.com/kgepachong/crawler"
    response = requests.get(url=location, headers=headers, cookies=cookie, allow_redirects=False)
    cookie.update(response.cookies.get_dict())
    location = response.headers.get("Location")
    return location


def get_login_user_info():
    headers["Host"] = "脱敏处理，完整代码关注 GitHub：https://github.com/kgepachong/crawler"
    headers["Origin"] = "脱敏处理，完整代码关注 GitHub：https://github.com/kgepachong/crawler"
    headers["Referer"] = "脱敏处理，完整代码关注 GitHub：https://github.com/kgepachong/crawler"
    params = {"time": str(int(time.time() * 1000))}
    response = requests.get(url=user_info_url, headers=headers, cookies=cookie, params=params)
    print(response.text)


def main():
    # 第一次获取 cookie，包含 INGRESSCOOKIE、JSESSIONID、SERVERID、acw_tc
    get_cookies_first()
    # 获取二维码
    get_login_qr_img()
    # websocket 扫码登录，返回一次性密码
    wss()
    # 第二次获取 cookie，更新 SERVERID、获取 CASLOGC、CASTGC
    location1 = get_cookie_second()
    # 第三次获取 cookie，获取 SESSION
    get_cookie_third(location1)
    # 获取登录用户信息
    get_login_user_info()


if __name__ == '__main__':
    main()
```



