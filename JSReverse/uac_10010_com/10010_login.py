#!/usr/bin/env python3
# -*- coding: utf-8 -*-


import re
import time
import random

import execjs
import requests
from PIL import Image


get_acw_tc_url = 'https://uac.10010.com/'
get_unisecid_url = 'https://uac.10010.com/oauth2/genqr'
get_ckuuid_url = 'https://uac.10010.com/portal/Service/CheckNeedVerify'
login_url = 'https://uac.10010.com/portal/Service/MallLogin'
create_image_url = 'https://uac.10010.com/portal/Service/CreateImage'
send_mobile_code_url = 'https://uac.10010.com/portal/Service/SendMSG'

user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
session = requests.session()
cookies = dict()


def get_result_code(string):
    return re.findall(r'resultCode:"(.*?)"', string)[0]


def get_jquery():
    jsonp = ''
    for _ in range(21):
        jsonp += str(random.randint(0, 9))
    jquery = 'jQuery' + jsonp + '_'
    return jquery


def get_acw_tc():
    headers = {'User-Agent': user_agent}
    response = session.get(url=get_acw_tc_url, headers=headers)
    cookie = response.cookies.get_dict()
    cookies.update(cookie)
    # print('1.acw_tc: ', cookies)


def get_unisecid():
    headers = {'User-Agent': user_agent}
    params = {'timestamp': str(int(time.time()*1000))}
    response = session.get(url=get_unisecid_url, params=params, cookies=cookies, headers=headers)
    cookie = response.cookies.get_dict()
    cookies.update(cookie)
    # print('2.unisecid: ', cookies)


def get_ckuuid(jquery, mobile):
    headers = {'User-Agent': user_agent}
    timestamp = str(int(time.time()*1000))
    callback = jquery + timestamp
    params = {
        'callback': callback,
        'userName': mobile,
        'pwdType': '01',
        '_': timestamp
    }
    response = session.get(url=get_ckuuid_url, params=params, cookies=cookies, headers=headers)
    cookie = response.cookies.get_dict()
    cookies.update(cookie)
    # print('3.ckuuid: ', cookies)


def get_verification_code():
    headers = {'User-Agent': user_agent}
    params = {'t': str(int(time.time()*1000))}
    response = session.get(url=create_image_url, params=params, cookies=cookies, headers=headers)
    cookie = response.cookies.get_dict()
    cookies.update(cookie)
    # print('4.uacverifykey: ', cookies)

    with open('code.png', 'wb') as f:
        f.write(response.content)
    image = Image.open('code.png')
    image.show()
    code = input('请输入图片验证码: ')
    return code


def get_encrypted_password(password):
    with open('10010_encrypt.js', 'r', encoding='utf-8') as f:
        exec_js = execjs.compile(f.read())
    encrypted_password = exec_js.call('getEncryptedPassword', password)
    return encrypted_password


def send_mobile_code(mobile, code, jquery):
    timestamp = str(int(time.time()*1000))
    callback = jquery + timestamp
    uac_verify_key = cookies['uacverifykey']
    params = {
        'callback': callback,
        'req_time': timestamp,
        'mobile': mobile,
        'uvc': uac_verify_key,
        'verifyCode': code,
        '_': timestamp
    }
    headers = {
        'User-Agent': user_agent,
        'x-requested-with': 'XMLHttpRequest',
        'Referer': 'https://uac.10010.com/portal/homeLoginNew',
        'sec-ch-ua': '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"',
        'accept': 'text/javascript, application/javascript, application/ecmascript, application/x-ecmascript, */*; q=0.01'
    }
    response = session.get(url=send_mobile_code_url, params=params, cookies=cookies, headers=headers).text
    if get_result_code(response) == '0000':
        print('短信验证码发送成功！')
    else:
        raise Exception('短信验证码发送失败！', response)


def login(mobile, encrypted_password, code, jquery):
    timestamp = str(int(time.time()*1000))
    callback = jquery + timestamp
    params = {
        'callback': callback,
        'req_time': timestamp,
        'redirectURL': 'http://www.10010.com',
        'userName': mobile,
        'password': encrypted_password,
        'pwdType': '02',
        'productType': '01',
        'verifyCode': code,
        'uvc': cookies['uacverifykey'],
        'redirectType': '01',
        'rememberMe': 1,
        '_': timestamp
    }
    headers = {
        'User-Agent': user_agent,
        'x-requested-with': 'XMLHttpRequest',
        'Referer': 'https://uac.10010.com/portal/homeLoginNew',
        'sec-ch-ua': '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"',
        'accept': 'text/javascript, application/javascript, application/ecmascript, application/x-ecmascript, */*; q=0.01'
    }
    response = session.post(url=login_url, params=params, cookies=cookies, headers=headers).text
    if get_result_code(response) == '0000':
        print('登录成功！', response)
    else:
        raise Exception('登录失败！', response)


def main():
    mobile = input('请输入手机号: ')
    if len(mobile) != 11:
        raise Exception('请输入正确的手机号码!')

    # 1. 生成 jquery，即 jQuery172005630071710613205_
    jquery = get_jquery()

    # 2. 获取 cookie 中的 acw_tc
    get_acw_tc()

    # 3. 获取 cookie 中的 unisecid
    get_unisecid()

    # 4. 获取 cookie 中的 ckuuid
    get_ckuuid(jquery, mobile)

    # 5. 获取 cookie 中的 uacverifykey、获取图片验证码
    code = get_verification_code()

    # 6. 发送手机短信验证码
    send_mobile_code(mobile, code, jquery)

    # 7. 输入短信验证码
    password = input('请输入短信验证码: ')

    # 8. 获取加密后的短信验证码
    encrypted_password = get_encrypted_password(password)

    # 9. 携带手机号、加密后的短信验证码、图片验证码登录
    login(mobile, encrypted_password, code, jquery)


if __name__ == '__main__':
    main()
