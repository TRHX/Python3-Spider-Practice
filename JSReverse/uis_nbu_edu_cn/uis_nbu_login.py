# ==================================
# --*-- coding: utf-8 --*--
# @Time    : 2021-08-02
# @Author  : TRHX
# @Blog    : www.itrhx.com
# @CSDN    : itrhx.blog.csdn.net
# @FileName: uis_nbu_login.py
# @Software: PyCharm
# ==================================


import execjs
import requests
from PIL import Image
from lxml import etree


login_url = 'https://uis.nbu.edu.cn/authserver/login'
ver_code_url = 'https://uis.nbu.edu.cn/authserver/captcha.html'
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
    'sec-ch-ua': '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"'
}
session = requests.session()


def get_parameter():
    response = session.get(url=login_url, headers=headers)
    tree = etree.HTML(response.text)
    lt = tree.xpath("//div[@tabid='01']//input[@name='lt']/@value")[0]
    dllt = tree.xpath("//div[@tabid='01']//input[@name='dllt']/@value")
    execution = tree.xpath("//div[@tabid='01']//input[@name='execution']/@value")
    event_id = tree.xpath("//div[@tabid='01']//input[@name='_eventId']/@value")
    rm_shown = tree.xpath("//div[@tabid='01']//input[@name='rmShown']/@value")
    encrypt_salt = tree.xpath("//div[@tabid='01']//input[@id='pwdDefaultEncryptSalt']/@value")[0]
    parameter = {
        'lt': lt,
        'dllt': dllt,
        'execution': execution,
        'event_id': event_id,
        'rm_shown': rm_shown,
        'encrypt_salt': encrypt_salt
    }
    return parameter


def get_encrypted_password(parameter, password):
    encrypt_salt = parameter['encrypt_salt']
    with open('uis_nbu_encrypt.js', 'r', encoding='utf-8') as f:
        nbu_js = f.read()
    encrypted_pwd = execjs.compile(nbu_js).call('getEncryptedPassword', password, encrypt_salt)
    return encrypted_pwd


def get_verification_code():
    response = session.get(url=ver_code_url, headers=headers)
    with open('code.png', 'wb') as f:
        f.write(response.content)
    image = Image.open('code.png')
    image.show()
    code = input('请输入验证码: ')
    return code


def login(parameter, encrypted_password, code, username):
    data = {
        'username': username,
        'password': encrypted_password,
        'captchaResponse': code,
        'lt': parameter['lt'],
        'dllt': parameter['dllt'],
        'execution': parameter['execution'],
        '_eventId': parameter['event_id'],
        'rmShown': parameter['rm_shown']
    }
    response = session.post(url=login_url, headers=headers, data=data)
    print(response.text)


def main():
    username = input('请输入登录账号: ')
    password = input('请输入登录密码: ')
    param = get_parameter()
    encrypted_password = get_encrypted_password(param, password)
    ver_code = get_verification_code()
    login(param, encrypted_password, ver_code, username)


if __name__ == '__main__':
    main()
