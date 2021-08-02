# ==================================
# --*-- coding: utf-8 --*--
# @Time    : 2021-08-02
# @Author  : TRHX
# @Blog    : www.itrhx.com
# @CSDN    : itrhx.blog.csdn.net
# @FileName: hqew_login.py
# @Software: PyCharm
# ==================================


import time
import base64
import hashlib

import execjs
import requests
from lxml import etree


index_url = 'https://passport.hqew.com/login'
login_url = 'https://passport.hqew.com/Login/DoLogin'
vistor_url = 'https://passport.hqew.com/hqewvistor?r===L2xvZ2lu&callback=HqewVistorCallback&_=%s'

session = requests.session()
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'sec-ch-ua': '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"',
}

with open('hqew_encrypt.js', 'r', encoding='utf-8') as f:
    hqew_js = f.read()


def get_encrypted_username_password(username, password):
    """ 用户名密码通过 base64 加密，可以使用 Python 实现，也可以调用 JS 实现"""
    # 调用 JS
    encrypted_username = execjs.compile(hqew_js).call('base64encode2', username)
    encrypted_password = execjs.compile(hqew_js).call('base64encode2', password)

    # 使用 Python
    # encrypted_username = base64.b64encode(username.encode('utf-8'))
    # encrypted_password = base64.b64encode(password.encode('utf-8'))

    return encrypted_username, encrypted_password


def get_cookies():
    # 首页取 randomstr，依次经过 MD5、SHA1 加密后得到 cookies 中的 passport_e
    response_index = session.get(url=index_url, headers=headers)
    tree = etree.HTML(response_index.text)
    random_str = tree.xpath("//input[@id='J_randomstr']/@value")[0]
    random_str_md5 = hashlib.md5(random_str.encode()).hexdigest()
    passport_e = execjs.compile(hqew_js).call('SHA1Encrypt', random_str_md5 + 'hqew')

    # 访问首页取 cookies 中的 Hqew_SessionId
    cookies_index = response_index.cookies.get_dict()
    session_id = cookies_index['Hqew_SessionId']

    # 访问 vistor 页面，取 cookies 中的 HQEWVisitor
    timestamp_13 = str(int(time.time() * 1000))
    timestamp_10 = str(int(time.time()))
    response_vistor = session.get(url=vistor_url % timestamp_13, headers=headers)
    cookies_vistor = response_vistor.cookies.get_dict()
    vistor = cookies_vistor['HQEWVisitor']

    # 各项参数组成最后登录需要的 cookies
    cookies = {
        'Hqew_SessionId': session_id,
        'HQEWVisitor': vistor,
        'Hm_lvt_9c14e7a660000edd280005fedf9fec5c': timestamp_10,
        'Hm_lpvt_9c14e7a660000edd280005fedf9fec5c': timestamp_10,
        'passport_e': passport_e
    }
    return cookies


def login(encrypted_username, encrypted_password, cookies):
    data = {
        'UserName': encrypted_username,
        'PassWord': encrypted_password,
        'ValidateCode': '',
        'LoginType': 0,
        'IsRemember': 0,
        'Source': ''
    }
    response = session.post(url=login_url, headers=headers, cookies=cookies, data=data)
    print(response.json())


def main():
    username = input('请输入登录账号: ')
    password = input('请输入登录密码: ')
    en_username, en_password = get_encrypted_username_password(username, password)
    cookies = get_cookies()
    login(en_username, en_password, cookies)


if __name__ == '__main__':
    main()
