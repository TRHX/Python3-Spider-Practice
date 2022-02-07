# ==================================
# --*-- coding: utf-8 --*--
# @Time    : 2022-01-05
# @Author  : ITBOB
# @Blog    : www.itbob.cn
# @CSDN    : itrhx.blog.csdn.net
# @FileName: main.py
# @Software: PyCharm
# ==================================


import re
import json
import base64
import execjs
import requests


index_url = "https://www.aqistudy.cn/"
aqistudy_api = "https://www.aqistudy.cn/apinew/aqistudyapi.php"
city_realtime_url = "https://www.aqistudy.cn/html/city_realtime.php?v=2.3"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36"
}


def get_encrypted_js_url():
    response = requests.get(url=city_realtime_url, headers=headers)
    encrypt_js_name = re.findall(r"(js/encrypt_.*?)\">", response.text)[0]
    encrypted_js_url = index_url + encrypt_js_name
    # print(encrypted_js_url)
    return encrypted_js_url


def get_decrypted_js(encrypted_js_url):
    """
    :param encrypted_js_url: encrypt_xxxxxx.js 的地址
    :return: 解密后的 JS
    """
    decrypted_js = requests.get(url=encrypted_js_url, headers=headers).text
    flag = True
    while flag:
        if "eval(function" in decrypted_js:
            # 需要执行 eval
            print("需要执行 eval！")
            replace_js = decrypted_js.replace("eval(function", "(function")
            decrypted_js = execjs.eval(replace_js)
        elif "dswejwehxt(" in decrypted_js:
            # 需要 base64 解码
            base64_num = decrypted_js.count("dswejwehxt(")
            print("需要 %s 次 base64 解码！" % base64_num)
            decrypted_js = re.findall(r"\('(.*?)'\)", decrypted_js)[0]
            num = 0
            while base64_num > num:
                decrypted_js = base64.b64decode(decrypted_js).decode()
                num += 1
        else:
            # 得到明文
            flag = False
    # print(decrypted_js)
    return decrypted_js


def get_key_iv_appid(decrypted_js):
    """
    :param decrypted_js: 解密后的 encrypt_xxxxxx.js
    :return: 请求必须的一些参数
    """
    key_iv = re.findall(r'const.*?"(.*?)";', decrypted_js)
    app_id = re.findall(r"var appId.*?'(.*?)';", decrypted_js)
    request_data_name = re.findall(r"aqistudyapi.php.*?data.*?{(.*?):", decrypted_js, re.DOTALL)

    # 判断 param 是 AES 加密还是 DES 加密还是没有加密
    if "AES.encrypt(param" in decrypted_js:
        request_param_encrypt = "AES"
    elif "DES.encrypt(param" in decrypted_js:
        request_param_encrypt = "DES"
    else:
        request_param_encrypt = "NO"

    key_iv_appid = {
        # key 和 iv 的位置和原来 js 里的是一样的
        "aes_key_1": key_iv[0],
        "aes_iv_1": key_iv[1],
        "aes_key_2": key_iv[2],
        "aes_iv_2": key_iv[3],
        "des_key_1": key_iv[4],
        "des_iv_1": key_iv[5],
        "des_key_2": key_iv[6],
        "des_iv_2": key_iv[7],
        "app_id": app_id[0],
        # 发送请求的 data 的键名
        "request_data_name": request_data_name[0].strip(),
        # 发送请求的 data 值需要哪种加密
        "request_param_encrypt": request_param_encrypt
    }
    # print(key_iv_appid)
    return key_iv_appid


def get_data(key_iv_appid):
    """
    :param key_iv_appid: get_key_iv_appid() 方法返回的值
    """
    request_method = "GETDATA"
    request_city = {"city": "北京"}
    with open('main.js', 'r', encoding='utf-8') as f:
        execjs_ = execjs.compile(f.read())

    # 根据不同加密方式调用不同方法获取请求加密的 param 参数
    request_param_encrypt = key_iv_appid["request_param_encrypt"]
    if request_param_encrypt == "AES":
        param = execjs_.call(
            'getRequestAESParam', request_method, request_city,
            key_iv_appid["app_id"], key_iv_appid["aes_key_2"], key_iv_appid["aes_iv_2"]
        )
    elif request_param_encrypt == "DES":
        param = execjs_.call(
            'getRequestDESParam', request_method, request_city,
            key_iv_appid["app_id"], key_iv_appid["des_key_2"], key_iv_appid["des_iv_2"]
        )
    else:
        param = execjs_.call('getRequestParam', request_method, request_city, key_iv_appid["app_id"])
    data = {
        key_iv_appid["request_data_name"]: param
    }
    response = requests.post(url=aqistudy_api, headers=headers, data=data).text
    # print(response)

    # 对获取的加密数据解密
    decrypted_data = execjs_.call(
        'getDecryptedData', response,
        key_iv_appid["aes_key_1"], key_iv_appid["aes_iv_1"],
        key_iv_appid["des_key_1"], key_iv_appid["des_iv_1"]
    )
    print(json.loads(decrypted_data))


def main():
    # 获取 encrypt_ 开头的 JS 文件地址
    encrypted_js_url = get_encrypted_js_url()
    # 获取 encrypt_ 开头的 JS 文件并对其进行 eval 和 base64 解密
    decrypted_js = get_decrypted_js(encrypted_js_url)
    # 获取 JS 里面的各种 key、iv、appId，判断 param 是 AES 还是 DES 还是没有
    key_iv_appid = get_key_iv_appid(decrypted_js)
    # 测试获取数据，以北京为例
    get_data(key_iv_appid)


if __name__ == '__main__':
    main()
