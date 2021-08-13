# ==================================
# --*-- coding: utf-8 --*--
# @Time    : 2021-08-13
# @Author  : TRHX
# @Blog    : www.itrhx.com
# @CSDN    : itrhx.blog.csdn.net
# @FileName: 189_login.py
# @Software: PyCharm
# ==================================


import json

import execjs
import requests
from PIL import Image
from lxml import etree


login_url = 'https://login.189.cn/web/login'
captcha_image_url = 'https://login.189.cn/web/captcha'
ajax_url = 'https://login.189.cn/web/login/ajax'
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}
session = requests.session()

with open('189_encrypt.js', 'r', encoding='utf-8') as f:
    exec_js = f.read()


def check_login_type(username):
    # 正常手机号登录，例如 13366666666
    if execjs.compile(exec_js).call('checkIsCellphone', username):
        return 201

    # 这个检测似乎没有用，但是在原 JS 中是存在的
    # elif execjs.compile(exec_js).call('checkIsCellphoneForCT', username):
    #     u_type = ???

    # 固话、宽带登录，例如 8637222
    elif execjs.compile(exec_js).call('checkIsTelephone', username):
        return judge_broadband_or_landline()

    # 邮件登录，例如 admin@itrhx.com
    elif execjs.compile(exec_js).call('checkIsMail', username):
        return 1

    # 其他情况默认是宽带，例如 1331700234、abcde
    else:
        return 203


def judge_broadband_or_landline():
    net_type = input('固话请输入1，宽带请输入2：')
    if net_type == '1':
        return 202
    elif net_type == '2':
        return 203
    else:
        print('输入有误，请重新输入！')
        judge_broadband_or_landline()


def get_city_info(u_type, username):
    # 如果是宽带或者固话，手动选择城市，如武汉、重庆、阿坝州、恩施
    if u_type == 202 or u_type == 203:
        city = input('请输入城市名（中文）：')
        data = {'m': 'querycity', 'key': city}
        response = session.post(url=ajax_url, data=data, headers=headers).text
        if response == '[]':
            raise Exception('对不起，找不到该城市！')
        else:
            city_info = json.loads(response.replace('[', '').replace(']', ''))
        # print(city_info)
        return city_info

    # 如果是手机号，则查询手机号归属地信息
    elif u_type == 201:
        data = {'m': 'checkphone', 'phone': username}
        response = session.post(url=ajax_url, data=data, headers=headers).text
        if response:
            city_info = json.loads(response)
        else:
            raise Exception('手机号归属地信息查询失败！')
        # print(city_info)
        return city_info

    # 其他情况不需要归属地信息，直接置空
    else:
        city_info = {
            'phonesen': '', 'provinceId': '', 'provinceName': '',
            'cityNo': '', 'cityName': '', 'areaCode': '',
            'netId': None, 'cardType': None, 'remark': None
        }
        return city_info


def get_encrypted_password(password):
    encrypted_password = execjs.compile(exec_js).call('valAesEncryptSet', password)
    return encrypted_password


def get_captcha_code():
    params = {
        'undefined': '',
        'source': 'login',
        'width': '100',
        'height': '37',
        '0.90480233478278': ''
    }
    response = session.get(url=captcha_image_url, params=params, headers=headers)
    with open('code.png', 'wb') as f:
        f.write(response.content)
    image = Image.open('code.png')
    image.show()
    code = input('请输入图片验证码: ')
    return code


def login(username, encrypted_password, code, u_type, city_info):
    params = {
        'Account': username,
        'UType': u_type,
        'ProvinceID': city_info['provinceId'],
        'AreaCode': city_info['areaCode'],
        'CityNo': city_info['cityNo'],
        'Captcha': code,
        'RandomFlag': '0',
        'Password': encrypted_password
    }
    response = session.post(url=login_url, params=params, headers=headers)
    # print(response.text)
    """
    若登录失败，可在网页里找到失败的原因
    登录成功会返回什么不知道，因为我没有电信手机来做实验
    """
    try:
        tree = etree.HTML(response.text)
        errmsg = tree.xpath("//form[@id='loginForm']/@data-errmsg")[0]
        print('登录失败！', errmsg)
    except Exception as error:
        # print(error)
        pass


def main():
    username = input('请输入登录账号: ')
    password = input('请输入登录密码: ')

    # 根据登录账号判断登录类型，手机、邮箱、宽带、固话
    u_type = check_login_type(username)

    # 获取账号归属地信息
    city_info = get_city_info(u_type, username)

    # 获取加密后的密码
    encrypted_password = get_encrypted_password(password)

    # 获取验证码
    code = get_captcha_code()

    # 登录
    login(username, encrypted_password, code, u_type, city_info)


if __name__ == '__main__':
    main()
