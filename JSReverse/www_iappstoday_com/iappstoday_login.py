# ==================================
# --*-- coding: utf-8 --*--
# @Time    : 2021-08-13
# @Author  : TRHX
# @Blog    : www.itrhx.com
# @CSDN    : itrhx.blog.csdn.net
# @FileName: iappstoday_login.py
# @Software: PyCharm
# ==================================


import execjs
import requests


login_url = 'http://www.iappstoday.com/ajax/login'


def get_encrypted_password(password):
    with open('iappstoday_encrypt.js', 'r', encoding='utf-8') as f:
        iappstoday_js = f.read()
    encrypted_password = execjs.compile(iappstoday_js).call('getEncryptedPassword', password)
    return encrypted_password


def login(username, encrypted_password):
    data = {
        'username': username,
        'password': encrypted_password
    }
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
    }
    response = requests.get(url=login_url, data=data, headers=headers).json()
    print(response)


def main():
    username = input('请输入登录账号: ')
    password = input('请输入登录密码: ')
    encrypted_pwd = get_encrypted_password(password)
    login(username, encrypted_pwd)


if __name__ == '__main__':
    main()
