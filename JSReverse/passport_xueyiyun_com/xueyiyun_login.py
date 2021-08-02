# ==================================
# --*-- coding: utf-8 --*--
# @Time    : 2021-08-02
# @Author  : TRHX
# @Blog    : www.itrhx.com
# @CSDN    : itrhx.blog.csdn.net
# @FileName: xueyiyun_login.py
# @Software: PyCharm
# ==================================


import base64

import execjs
import requests


session = requests.session()
login_url = 'https://passport.xueyiyun.com/Login?returnUrl=%2f'
public_key_url = 'https://passport.xueyiyun.com/api/account/rsaPublicKeyToBit'
user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'


def get_rsa_public_key():
    headers = {'User-Agent': user_agent}
    public_key = session.get(url=public_key_url, headers=headers).json()
    return public_key


def get_encrypted_password(rsa_public_key, password):
    with open('xueyiyun_encrypt.js', 'r', encoding='utf-8') as f:
        xueyiyun_js = f.read()
    encrypted_password = execjs.compile(xueyiyun_js).call('getEncryptedCiphertext', rsa_public_key, password)
    encrypted_password = base64.b64encode(encrypted_password.encode("utf-8")).decode("utf-8")
    return encrypted_password


def login(encrypted_password, username):
    headers = {
        'User-Agent': user_agent,
        'x-requested-with': 'XMLHttpRequest',
        'origin': 'https://passport.xueyiyun.com',
        'referer': 'https://passport.xueyiyun.com/login'
    }
    data = {
        'Username': username,
        'Password': encrypted_password,
        'RememberMe': False
    }
    response = session.post(url=login_url, headers=headers, data=data)
    print(response.json())


def main():
    username = input('请输入登录账号: ')
    password = input('请输入登录密码: ')
    key = get_rsa_public_key()
    encrypted_password = get_encrypted_password(key, password)
    login(encrypted_password, username)


if __name__ == '__main__':
    main()

