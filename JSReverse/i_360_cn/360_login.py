# ==================================
# --*-- coding: utf-8 --*--
# @Time    : 2021-08-20
# @Author  : TRHX
# @Blog    : www.itrhx.com
# @CSDN    : itrhx.blog.csdn.net
# @FileName: 360_login.py
# @Software: PyCharm
# ==================================


import re
import json
import random
import time
import base64
from urllib import parse

import execjs
import requests
from PIL import Image


login_url = 'https://login.360.cn/'
captcha_url_ = 'https://passport.360.cn/captcha.php'
headers = {
    'sec-ch-ua': '"Chromium";v="92", " Not A;Brand";v="99", "Google Chrome";v="92"',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}
session = requests.session()


def get_jquery():
    jsonp = ''
    for _ in range(21):
        jsonp += str(random.randint(0, 9))
    timestamp = str(int(time.time() * 1000))
    jquery = 'jQuery' + jsonp + '_' + timestamp
    return jquery


def get_dict_from_jquery(text):
    result = re.findall(r'\((.*?)\)', text)[0]
    return json.loads(result)


def get_token(username):
    params = {
        'func': get_jquery(),
        'src': 'pcw_i360',
        'from': 'pcw_i360',
        'charset': 'UTF-8',
        'requestScema': 'https',
        'quc_sdk_version': '1.0.2',
        'quc_sdk_name': 'jssdk',
        'o': 'sso',
        'm': 'getToken',
        'userName': username,
        '_': str(int(time.time() * 1000))
    }
    response = session.get(url=login_url, params=params, headers=headers).text
    token = get_dict_from_jquery(response)['token']
    return token


def get_encrypted_password(password):
    with open('360_encrypt.js', 'r', encoding='utf-8') as f:
        i_360_js = f.read()
    encrypted_password = execjs.compile(i_360_js).call('getEncryptedPassword', password)
    return encrypted_password


def check_need_captcha(username):
    params = {
        'callback': get_jquery(),
        'src': 'pcw_i360',
        'from': 'pcw_i360',
        'charset': 'UTF-8',
        'requestScema': 'https',
        'quc_sdk_version': '1.0.2',
        'quc_sdk_name': 'jssdk',
        'o': 'sso',
        'm': 'checkNeedCaptcha',
        'account': username,
        'captchaApp': 'i360',
        '_': str(int(time.time() * 1000))
    }
    response = session.get(url=login_url, params=params, headers=headers).text
    response_dict = get_dict_from_jquery(response)
    captcha_flag = response_dict['captchaFlag']
    captcha_url = response_dict['captchaUrl']
    # print(captcha_flag, captcha_url)
    return captcha_url, captcha_flag


def get_captcha(captcha_url):
    app = re.findall('app=(.*?)&', captcha_url)[0]
    userip = re.findall('userip=(.*?)&', captcha_url)[0]
    level = re.findall('level=(.*?)&', captcha_url)[0]
    sign = re.findall('sign=(.*?)&', captcha_url)[0]
    r = re.findall(r'r=(\d+)', captcha_url)[0]
    params = {
        'm': 'create',
        'app': app,
        'scene': 'login',
        'userip': parse.unquote(userip),
        'level': level,
        'sign': sign,
        'r': r,
        '_': str(int(time.time() * 1000)),
        'border': None,
        'format': 'json',
        'callback': get_jquery()
    }
    response = session.get(url=captcha_url, params=params, headers=headers).text
    response_dict = get_dict_from_jquery(response)
    img_data = base64.b64decode(response_dict['image'])
    qucrypt_code = response_dict['qucrypt_code']
    with open('code.png', 'wb') as f:
        f.write(img_data)
    image = Image.open('code.png')
    image.show()
    captcha = input('请输入图片验证码: ')
    return captcha, qucrypt_code


def login(username, encrypted_password, token, captcha=None, qucrypt_code=None):
    data = {
        'src': 'pcw_i360',
        'from': 'pcw_i360',
        'charset': 'UTF-8',
        'requestScema': 'https',
        'quc_sdk_version': '1.0.2',
        'quc_sdk_name': 'jssdk',
        'o': 'sso',
        'm': 'login',
        'lm': 0,
        'captFlag': 1,
        'rtype': 'data',
        'validatelm': 0,
        'isKeepAlive': 1,
        'captchaApp': 'i360',
        'userName': username,
        'smDeviceId': '',
        'type': 'normal',
        'account': username,
        'password': encrypted_password,
        'captcha': captcha,
        'qucrypt_code': qucrypt_code,
        'token': token,
        'proxy': 'https://i.360.cn/psp_jump.html',
        'callback': 'QiUserJsonp169518483',
        'func': 'QiUserJsonp169518483'
    }
    response = session.post(url=login_url, data=data, headers=headers)
    # print(response.text)
    href = re.findall("location.href='(.*)'", response.text)[0]
    errno = re.findall('errno=(.*?)&', href)[0]
    errmsg = re.findall('errmsg=(.*?)&', href)[0]
    if errno == '0':
        userinfo = re.findall('userinfo=(.*?)&', href)[0]
        print('登录成功! userinfo: %s' % parse.unquote(userinfo))
    else:
        print('登录失败! errno: %s, errmsg: %s' % (errno, parse.unquote(errmsg)))


def main():
    username = input('请输入登录账号: ')
    password = input('请输入登录密码: ')

    # 获取 token
    token = get_token(username)

    # 获取加密后的密码
    encrypted_password = get_encrypted_password(password)

    # 检测是否需要输入验证码
    captcha_url, captcha_flag = check_need_captcha(username)

    # 如果需要验证码，则获取验证码和 qucrypt_code 参数
    if captcha_flag:
        captcha, qucrypt_code = get_captcha(captcha_url)
        login(username, encrypted_password, token, captcha, qucrypt_code)

    # 不需要则直接登录
    else:
        login(username, encrypted_password, token)


if __name__ == '__main__':
    main()
