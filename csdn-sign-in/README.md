# CSDN Sign In - CSDN 自动签到抽奖

实现时间：2021-05-29
注意事项：cookie 的值需要你登录后 F12 查看复制过来，cookie 的有效期是多久暂时不得而知，等下次失效了我再回来告诉你们有效期是多久，如果我没说，那就代表一直没失效！😁

# CSDN_1.py

简单的签到抽奖功能，运行前把 CSDN_ID 和 COOKIE 设置成你的即可。

# CSDN_2.py

通过 GitHub Actions 实现了每天自动签到抽奖功能，签到结果可选通知：Server 酱、企业微信、钉钉，代码不能直接运行，这是放到 GitHub Actions 上执行的代码，使用方法见 https://github.com/TRHX/CSDNSignIn ，如果要本地运行，则需要将配置项目 1 2 3 中 os.environ["xxxxx"] 换成各自对应的值！
