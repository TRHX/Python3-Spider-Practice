# ==================================
# --*-- coding: utf-8 --*--
# @Time    : 2021-08-02
# @Author  : TRHX
# @Blog    : www.itrhx.com
# @CSDN    : itrhx.blog.csdn.net
# @FileName: hfax_login.py
# @Software: PyCharm
# ==================================


import re
import base64
import hashlib

import execjs
import requests
from PIL import Image


index_url = 'https://www.hfax.com/login.html'
login_page_url = 'https://www.hfax.com/pc-api/loginPageUrl'
login_url = 'https://www.hfax.com/pc-api/user/login'
pre_login_url = 'https://www.hfax.com/pc-api/common/imageCode/login'

headers = {
    'sec-ch-ua': '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}
session = requests.session()


def get_cookies():
    response_index = session.get(url=index_url, headers=headers)
    cookies_index_dict = response_index.cookies.get_dict()
    # print(cookies_index_dict)

    response_page = session.get(url=login_page_url, headers=headers, cookies=cookies_index_dict)
    cookies_page_dict = response_page.cookies.get_dict()
    # print(cookies_page_dict)

    cookies_index_dict.update(cookies_page_dict)
    return cookies_index_dict


def get_code_data(cookies):
    response = session.get(url=pre_login_url, headers=headers, cookies=cookies).json()
    # print(response)
    return response


def get_code(code_base64):
    result = re.search("data:image/(?P<img_type>.*?);base64,(?P<img_data>.*)", code_base64, re.DOTALL)
    code_type = result.groupdict().get('img_type')
    code_data = result.groupdict().get('img_data')
    code_data = base64.urlsafe_b64decode(code_data)
    code_name = 'code.%s' % code_type
    with open(code_name, 'wb') as f:
        f.write(code_data)
    image = Image.open(code_name)
    image.show()
    code_value = input('请输入验证码: ')
    return code_value


def get_encrypted_password(password):
    # 使用 JS 获取加密后的密码
    # with open('hfax_encrypt.js', 'r', encoding='utf-8') as f:
    #     hfax_js = f.read()
    # encrypted_password = execjs.compile(hfax_js).call('getEncryptedPassword', password)
    # return encrypted_password

    # 使用 Python 实现密码的加密
    md5 = hashlib.md5()
    md5.update((password + 'TuD00Iqz4ge7gzIe2rmjSAFFKtaIBmnr8S').encode())
    encrypted_password = md5.hexdigest()
    return encrypted_password


def login(code, code_token, username, encrypted_password, cookies):
    data = {
        'imgCode': code,
        'imgToken': code_token,
        'password': encrypted_password,
        'username': username
    }
    response = session.post(url=login_url, headers=headers, json=data, cookies=cookies)
    print(response.json())


def main():
    username = input('请输入登录账号: ')
    password = input('请输入登录密码: ')

    # 通过两个链接获取 cookies
    cookies = get_cookies()

    # 通过预登陆链接，获取验证码 token 和 base64 字符串
    parameter = get_code_data(cookies)

    # 分别取验证码的 token 和 base64 字符串
    code_base64 = parameter['data']['base64Str']
    code_token = parameter['data']['token']

    # 通过 base64 字符串保存并显示验证码
    code = get_code(code_base64)

    # 获取加密后的密码
    encrypted_password = get_encrypted_password(password)

    # 携带验证码、验证码 token、用户名、加密后的密码以及 cookies 登录
    login(code, code_token, username, encrypted_password, cookies)


if __name__ == '__main__':
    main()
