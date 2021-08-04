# ==================================
# --*-- coding: utf-8 --*--
# @Time    : 2021-08-04
# @Author  : TRHX
# @Blog    : www.itrhx.com
# @CSDN    : itrhx.blog.csdn.net
# @FileName: 10086_login.py
# @Software: PyCharm
# ==================================


import time

import execjs
import requests


login_url = 'https://login.10086.cn/login.htm'
send_code_url = 'https://login.10086.cn/sendRandomCodeAction.action'
chk_number_url = 'https://login.10086.cn/chkNumberAction.action'
user_agent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1'
session = requests.session()


def get_encrypted_data(username, password):
    with open('10086_encrypt.js', 'r', encoding='utf-8') as f:
        exec_js = execjs.compile(f.read())
    encrypted_username = exec_js.call('getEncryptedData', username)
    encrypted_password = exec_js.call('getEncryptedData', password)
    return encrypted_username, encrypted_password


def chk_number(encrypted_username):
    data = {
        'userName': encrypted_username,
        'loginMode': '03',
        'channelID': '10000'
    }
    headers = {'User-Agent': user_agent}
    response = session.post(url=chk_number_url, data=data, headers=headers).text
    if response == 'false':
        raise Exception('账号非移动账号！')


def send_code(encrypted_username):
    data = {
        'userName': encrypted_username,
        'type': '01',
        'channelID': '12022'
    }
    headers = {'User-Agent': user_agent}
    response = session.post(url=send_code_url, data=data, headers=headers).text
    # print(response)


def login(encrypted_password, encrypted_username, code):
    data = {
        'accountType': '01',
        'pwdType': '01',
        'account': encrypted_username,
        'password': encrypted_password,
        'smsPwd': code,
        'backUrl': 'https://wap.10086.cn/hb/index_270_270.html?s=1',
        'rememberMe': '0',
        'channelID': '12022',
        'loginMode': '03',
        'protocol': 'https:',
        'timestamp': str(int(time.time() * 1000))
    }
    headers = {
        'User-Agent': user_agent,
        'Host': 'login.10086.cn',
        'Origin': 'https://login.10086.cn',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': 'https://login.10086.cn/html/login/touch.html?channelID=12022&backUrl=https://wap.10086.cn/hb/index_270_270.html?s=1'
    }
    response = session.post(url=login_url, data=data, headers=headers)
    print(response.text)


def main():
    username = input('请输入账号: ')
    password = input('请输入密码: ')
    encrypted_username, encrypted_password = get_encrypted_data(username, password)
    chk_number(encrypted_username)
    send_code(encrypted_username)
    code = input('请输入验证码: ')
    login(encrypted_username, encrypted_password, code)


if __name__ == '__main__':
    main()
