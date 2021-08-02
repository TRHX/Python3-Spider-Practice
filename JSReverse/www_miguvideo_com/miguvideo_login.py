# ==================================
# --*-- coding: utf-8 --*--
# @Time    : 2021-08-02
# @Author  : TRHX
# @Blog    : www.itrhx.com
# @CSDN    : itrhx.blog.csdn.net
# @FileName: miguvideo_login.py
# @Software: PyCharm
# ==================================


import execjs
import requests


login_url = 'https://passport.migu.cn/authn'
public_key_url = 'https://passport.migu.cn/password/publickey'
headers = {
    'sec-ch-ua': '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}
session = requests.session()


def get_public_key():
    response = session.post(url=public_key_url, headers=headers).json()
    return response


def get_encrypted_parameter(public_key, username, password):
    with open('miguvideo_encrypt.js', 'r', encoding='utf-8') as f:
        miguvideo_js = f.read()
    exec_js = execjs.compile(miguvideo_js)
    login_id = exec_js.call('getLoginID', public_key, username)
    encrypted_password = exec_js.call('getEncryptedPassword', public_key, password)
    finger_print = exec_js.call('getFingerPrint', public_key)
    encrypted_parameter = {
        'login_id': login_id,
        'encrypted_password': encrypted_password,
        'finger_print': finger_print['result'],
        'finger_print_detail': finger_print['details']
    }
    return encrypted_parameter


def login(encrypted_parameter):
    data = {
        'sourceID': 203021,
        'appType': 2,
        'relayState': 'login',
        'loginID': encrypted_parameter['login_id'],
        'enpassword': encrypted_parameter['encrypted_password'],
        'captcha': '',
        'imgcodeType': 1,
        'fingerPrint': encrypted_parameter['finger_print'],
        'fingerPrintDetail': encrypted_parameter['finger_print_detail'],
        'isAsync': True
    }
    response = session.post(url=login_url, headers=headers, data=data)
    print(response.json())


def main():
    username = input('请输入登录账号: ')
    password = input('请输入登录密码: ')
    public_key = get_public_key()
    encrypted_parameter = get_encrypted_parameter(public_key, username, password)
    login(encrypted_parameter)


if __name__ == '__main__':
    main()
