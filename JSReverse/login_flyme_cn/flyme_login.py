# ==================================
# --*-- coding: utf-8 --*--
# @Time    : 2021-08-27
# @Author  : TRHX
# @Blog    : www.itrhx.com
# @CSDN    : itrhx.blog.csdn.net
# @FileName: flyme_login.py
# @Software: PyCharm
# ==================================


import execjs
import requests


login_url = 'https://login.flyme.cn/sso/unionlogin'


def get_encrypted_password(password):
    with open('flyme_encrypt.js', 'r', encoding='utf-8') as f:
        exec_js = f.read()
    encrypted_password = execjs.compile(exec_js).call('getEncryptedPassword', password)
    return encrypted_password


def login(username, encrypted_password):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    params = {
        'cycode': '+86',
        'account': '0086: %s' % username,
        'password': encrypted_password,
        'abnormal': '',
        'kapkey': '',
        'appuri': '',
        'useruri': 'http://store.meizu.com/member/login.htm?useruri=http://www.meizu.com',
        'service': 'store',
        'sid': 'unionlogin',
        'geetest_challenge': '',
        'geetest_validate': '',
        'geetest_seccode': '',
        'unCommonlandedCode': '',
    }
    response = requests.post(url=login_url, params=params, headers=headers)
    print(response.json())


def main():
    username = input('请输入登录账号: ')
    password = input('请输入登录密码: ')
    encrypted_password = get_encrypted_password(password)
    login(username, encrypted_password)


if __name__ == '__main__':
    main()
