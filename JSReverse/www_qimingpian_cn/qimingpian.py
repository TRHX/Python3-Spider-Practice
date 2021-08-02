# ==================================
# --*-- coding: utf-8 --*--
# @Time    : 2021-08-02
# @Author  : TRHX
# @Blog    : www.itrhx.com
# @CSDN    : itrhx.blog.csdn.net
# @FileName: qimingpian.py
# @Software: PyCharm
# ==================================


import json

import execjs
import requests


data_url = 'https://vipapi.qimingpian.com/DataList/productListVip'


def get_encrypted_data():
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Host': 'vipapi.qimingpian.com',
        'Origin': 'https://www.qimingpian.cn',
        'sec-ch-ua': '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    data = {
        'time_interval': '',
        'tag': '',
        'tag_type': '',
        'province': '',
        'lunci': '',
        'page': 1,
        'num': 20,
        'unionid': ''
    }
    encrypted_data = requests.post(url=data_url, headers=headers, data=data)
    encrypted_data = encrypted_data.json()['encrypt_data']
    return encrypted_data


def get_decrypted_data(encrypted_data):
    with open('qimingpian_decrypt.js', 'r', encoding='utf-8') as f:
        qimingpian_js = f.read()
    decrypted_data = execjs.compile(qimingpian_js).call('getDecryptedData', encrypted_data)
    return json.loads(decrypted_data)


def main():
    encrypted_data = get_encrypted_data()
    decrypted_data = get_decrypted_data(encrypted_data)
    print(decrypted_data)


if __name__ == '__main__':
    main()
