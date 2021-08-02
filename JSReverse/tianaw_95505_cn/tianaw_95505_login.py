# ==================================
# --*-- coding: utf-8 --*--
# @Time    : 2021-08-02
# @Author  : TRHX
# @Blog    : www.itrhx.com
# @CSDN    : itrhx.blog.csdn.net
# @FileName: tianaw_95505_login.py
# @Software: PyCharm
# ==================================


import time
import json
import base64

import execjs
import requests
from Cryptodome.PublicKey import RSA
from Cryptodome.Cipher import PKCS1_v1_5


login_url = 'https://tianaw.95505.cn/tacpc/tiananapp/customer_login/taPcLogin'
with open('tianaw_95505_encrypt.js', 'r', encoding='utf-8') as f:
    tianaw_95505_js = f.read()


def get_priva_key():
    priva_key = execjs.compile(tianaw_95505_js).call('getPrivaKey', 16)
    return priva_key


def get_json_key(priva_key, username, password):
    time_now = str(int(time.time() * 1000))
    data = {
        "body": {
            "loginMethod": "1",
            "name": username,
            "password": password
        },
        "head": {
            "userCode": None,
            "channelCode": "101",
            "transTime": time_now,
            "transToken": "",
            "customerId": None,
            "transSerialNumber": ""
        }
    }
    data_str = json.dumps(data)
    json_key = execjs.compile(tianaw_95505_js).call('getJsonKey', data_str, priva_key)
    print(json_key)
    return json_key


def get_header_key(priva_key):
    public_key = "MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAM1xhOWaThSMpfxFsjV5YaWOFHt+6RvS+zH2Pa47VVr8PkZYnRaaKKy2MYBuEh7mZfM/R1dUXTgu0gp6VTNeNQkCAwEAAQ=="
    # 导入公钥
    rsa_key = RSA.import_key(base64.b64decode(public_key))
    # 生成对象
    rsa_object = PKCS1_v1_5.new(rsa_key)
    # 加密
    header_key = base64.b64encode(rsa_object.encrypt(priva_key.encode(encoding="utf-8")))
    return header_key


def login(header_key, json_key):
    data = {'jsonKey': json_key}
    headers = {
        'key': header_key,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
        'sec-ch-ua': '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"'
    }
    response = requests.post(url=login_url, headers=headers, params=data, data=data)
    print(response.text)


def main():
    username = input('请输入登录账号: ')
    if len(username) < 11:
        print('账号不正确！')
        return
    password = input('请输入登录密码: ')
    if len(password) < 8:
        print('密码不正确！')
        return

    # 获取 priva key
    priva_key = get_priva_key()

    # 获取 json key
    json_key = get_json_key(priva_key, username, password)

    # 获取 header 里面的 key，由 priva key 经过 RSA 加密得到
    header_key = get_header_key(priva_key)

    # 携带两个 key 登录
    login(header_key, json_key)


if __name__ == '__main__':
    main()
