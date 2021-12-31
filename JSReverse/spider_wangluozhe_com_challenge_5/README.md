![](https://i.loli.net/2021/08/07/JbP4zaS2TxU6Rkd.png)

> 关注微信公众号：K哥爬虫，持续分享爬虫进阶、JS/安卓逆向等技术干货！

## 声明

**本文章中所有内容仅供学习交流，抓包内容、敏感网址、数据接口均已做脱敏处理，严禁用于商业用途和非法用途，否则由此产生的一切后果均与作者无关，若有侵权，请联系我立即删除！**

## 逆向目标

- 目标：网洛者反反爬虫练习平台第五题：控制台反调试
- 链接：http://spider.wangluozhe.com/challenge/5
- 简介：打开浏览器控制台，控制台 Console 位置输出 bbbb[0] 可看见答案，填上答案提交即可。

![01.png](https://s2.loli.net/2021/12/20/5awuk8Gjb3DYfAH.png)

## 逆向过程

我们直接打开控制台，发现右键不能使用，直接 F12，页面就会直接跳转到首页了，问题不大，新起一个页面，先打开 F12 再进入页面即可，此时可以看到控制台在疯狂输出 div 标签，如下图所示：

![02.png](https://s2.loli.net/2021/12/20/kQebU9xvBaRDn4P.png)

这里比较尴尬的就是，虽然控制台在不断刷 div，但是对我们的输入没有太大影响，直接输入 `bbbb[0]`，往上找一找，就可以看到答案了，或者直接输入 `copy(bbbb[0])` 就直接把答案复制到粘贴板了。如下图所示：

![03.png](https://s2.loli.net/2021/12/20/IYG2gu4t1FdD8Wj.png)

这个题不知道是什么原因，有可能是出题不太规范让我们直接钻空子了，作者的本意应该是让我们去掉这个无限刷 div 的情况，再去获取答案的，所以我们还是来分析一下源码，可以看到输出 div 的方法都在 5.js 里，直接点进去，是一个 setInterval 定时器方法：

![04.png](https://s2.loli.net/2021/12/20/ad5efMFvY2c4jDg.png)

处理方法有很多：

1. Hook 定时器，将输出 div 的语句删除；
2. 替换 JS 代码，直接将定时器或者输出 div 的语句删除；
3. 直接控制台 Hook，将定时器方法置空。

本次我们直接在控制台 Hook，将定时器置空，这里注意，如果程序已经进入了定时器，再 Hook 是没用的，所以正确的做法是在定时器前，比如 `let div` 的地方下个断点，刷新网页，再在控制台输入 `setInterval = function() {};` 将定时器置空，再放开断点输入  `bbbb[0]` 获取答案：

![05.png](https://s2.loli.net/2021/12/20/ymUA4HcGQ8vkeWD.png)

![06.png](https://s2.loli.net/2021/12/20/SWBUafILkR9ujlQ.png)

我们注意到控制台有个报错 `Uncaught SyntaxError: Identifier 'div' has already been declared`，这是因为在 JS 和页面的 HTML 里各自声明了一遍 div 导致的，在页面的 HTML 里再次声明时就会报错，对我们结果的获取没有影响。至此，本题分析完毕。提交答案成功：

![07.png](https://s2.loli.net/2021/12/21/sHTRKXU9b18mj3i.png)



