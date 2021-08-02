# CSDN 自动签到抽奖

实现时间：2021-05-29

CSDN 文章：https://itrhx.blog.csdn.net/article/details/117375471

注意事项：

- cookie 的值需要你登录后 F12 查看复制过来，~~cookie 的有效期是多久暂时不得而知，等下次失效了我再回来告诉你们有效期是多久，如果我没说，那就代表一直没失效！😁~~

- 经过测试，cookie 的有效期在 45 天左右，失效后需要重新复制一个新 cookie 过来！

- 如果你开启了自动抽奖，程序会识别你当前还有多少次抽奖次数，如果抽奖次数为0，则仍然不执行抽奖任务！

# CSDN_1.py

简单的签到抽奖功能，运行前把 CSDN_ID 和 COOKIE 设置成你的即可。

# CSDN_2.py

通过 GitHub Actions 实现了每天自动签到抽奖功能，签到结果可选通知：Server 酱、企业微信、钉钉，代码不能直接运行，这是放到 GitHub Actions 上执行的代码，使用方法见 https://github.com/TRHX/CSDNSignIn ，如果要本地运行，则需要将配置项目 1 2 3 中的 os.environ["xxxxx"] 换成各自对应的值！
