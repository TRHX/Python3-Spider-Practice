#!/usr/bin/env python3
# -*- coding: utf-8 -*-


import execjs
import requests


login_url = 'https://passport.yhd.com/publicPassport/login.do'
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
}


def get_encrypted_data(username, password):
    with open('yhd_encrypt.js', 'r', encoding='utf-8') as f:
        yhd_js = f.read()
    encrypted_data = execjs.compile(yhd_js).call('getEncryptedData', username, password)
    return encrypted_data


def login(encrypted_data):
    data = {
        'credentials.username': encrypted_data['encryptedUsername'],
        'credentials.password': encrypted_data['encryptedPassword'],
        'sig': '',
        'is_jab': True,
        'captchaToken': '',
        'jab_st': 1,
        'loginSource': 1,
        'returnUrl': 'http://www.yhd.com',
        'isAutoLogin': 0,
        'slideData': ''
    }
    response = requests.post(url=login_url, data=data, headers=headers)
    print(response.text)


def main():
    username = input('请输入登录账号: ')
    password = input('请输入登录密码: ')
    encrypted_data = get_encrypted_data(username, password)
    login(encrypted_data)


if __name__ == '__main__':
    main()
