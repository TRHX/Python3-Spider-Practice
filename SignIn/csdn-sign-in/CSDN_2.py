# ====================================
# --*-- coding: utf-8 --*--
# @Time    : 2021-05-29
# @Author  : TRHX • 鲍勃
# @Blog    : www.itrhx.com
# @CSDN    : itrhx.blog.csdn.net
# @FileName: CSDN.py
# @Software: PyCharm
# ====================================

import requests
import json
import os
import time
import hmac
import hashlib
import base64
import urllib.parse

# ==============  1.CSDN 个人信息 ============== #
CSDN_ID = os.environ["CSDN_ID"]            # 必填！CSDN 的 ID
COOKIE = os.environ["COOKIE"]              # 必填！已登录的 cookie

# ==============  2.功能开关配置项 ============== #
# 填 on 则开启，开启的同时也需要配置3中的选项，不填或填其他则关闭
IF_LUCK_DRAW = os.environ["IF_LUCK_DRAW"]  # 选填！是否开启抽奖
IF_SEVER = os.environ["IF_SEVER"]          # 选填！是否开启 server 酱通知
IF_WECHAT = os.environ["IF_WECHAT"]        # 选填！是否开启企业微信通知
IF_DING = os.environ["IF_DING"]            # 选填！是否开启钉钉通知

# ==============  3.消息通知配置项 ============== #
SEVER_SCKEY = os.environ["SEVER_SCKEY"]    # 选填！server 酱的 SCKEY
WECHAT_URL = os.environ["WECHAT_URL"]      # 选填！企业微信机器人地址
DING_URL = os.environ["DING_URL"]          # 选填！钉钉机器人地址
DING_SECRET = os.environ["DING_SECRET"]    # 选填！钉钉机器人加签 SECRET

# ==============  4.准备发送的消息 ============== #
TEXT = ''
DESP = ''


class CSDN:
    def __init__(self):
        self.DRAW_TIMES = 0  # 可抽奖次数
        self.UUID = COOKIE.split(';', 1)[0].split('=', 1)[1]
        self.USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.72 Safari/537.36'
        self.SIGN_IN_URL = 'https://me.csdn.net/api/LuckyDraw_v2/signIn'
        self.LUCKY_DRAW_URL = 'https://me.csdn.net/api/LuckyDraw_v2/goodLuck'
        self.HEADERS = {
            'accept': 'application/json, text/plain, */*',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
            'content-length': '243',
            'content-type': 'application/json;charset=UTF-8',
            'cookie': COOKIE,
            'origin': 'https://i.csdn.net',
            'referer': 'https://i.csdn.net/',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
            'user-agent': self.USER_AGENT
        }
        self.DATA = {
            'ip': '',
            'platform': 'pc-my',
            'product': 'pc',
            'user_agent': self.USER_AGENT,
            'username': CSDN_ID,
            'uuid': self.UUID
        }

    def csdn_sign_in(self) -> None:
        global TEXT, DESP
        response = requests.post(url=self.SIGN_IN_URL, headers=self.HEADERS, data=self.DATA)
        result = json.loads(response.text)
        # print(result)

        if result['code'] == 200:
            if not result['data']['isSigned'] and result['data']['signed']:
                keep_count = result['data']['keepCount']
                total_count = result['data']['totalCount']
                total_signed_count = result['data']['totalSignedCount']
                # self.STAR = result['data']['star']
                self.DRAW_TIMES = result['data']['drawTimes']
                TEXT = 'CSDN 签到成功！'
                DESP = 'CSDN 签到成功！你已连续签到 {} 天，累计签到 {} 天，当前已有 {} 人签到。'.format(keep_count, total_count, total_signed_count)
                print('签到成功！你已连续签到 {} 天，累计签到 {} 天，当前已有 {} 人签到。'.format(keep_count, total_count, total_signed_count))
            elif result['data']['isSigned']:
                TEXT = 'CSDN 签到失败！'
                DESP = 'CSDN 签到失败！你今天已经签到过了哟！'
                print('你今天已经签到过了哟！')
            else:
                TEXT = 'CSDN 签到失败！'
                print('签到失败！')
        elif result['code'] == 400102:
            TEXT = 'CSDN 签到失败！'
            DESP = 'CSDN 签到失败！{} 用户不存在或者 cookie 错误！请检查 CSDN ID 或尝试重置 cookie！'.format(CSDN_ID)
            print('签到失败！{} 用户不存在或者 cookie 错误！请检查 CSDN ID 或尝试重置 cookie！'.format(CSDN_ID))
        else:
            TEXT = 'CSDN 签到失败！'
            print('签到失败！')

    def csdn_luck_draw(self) -> None:
        if self.DRAW_TIMES != 0:
            global TEXT, DESP
            response = requests.post(url=self.LUCKY_DRAW_URL, headers=self.HEADERS, data=self.DATA)
            result = json.loads(response.text)
            print(result)

            if result['code'] == 200:
                if result['data']['can_draw']:
                    prize_title = result['data']['prize_title']
                    TEXT += 'CSDN 抽奖成功！'
                    DESP += '抽奖成功！恭喜你获得{}'.format(prize_title)
                    print('抽奖成功！恭喜你获得{}'.format(prize_title))
                elif not result['data']['can_draw']:
                    TEXT += 'CSDN 抽奖失败！'
                    DESP += 'CSDN 抽奖失败！抽奖机会已经用完了哟！'
                    print('抽奖机会已经用完了哟！')
                else:
                    TEXT += 'CSDN 抽奖失败！'
                    print('抽奖失败！')
            elif result['code'] == 400102:
                TEXT = 'CSDN 抽奖失败！'
                DESP = 'CSDN 抽奖失败！{} 用户不存在或者 cookie 错误！请检查 CSDN ID 或尝试重置 cookie！'.format(CSDN_ID)
                print('抽奖失败！{} 用户不存在或者 cookie 错误！请检查 CSDN ID 或尝试重置 cookie！'.format(CSDN_ID))
            else:
                TEXT += 'CSDN 抽奖失败！'
                print('抽奖失败！')


class Notice:
    @staticmethod
    def sever() -> None:
        requests.get('https://sc.ftqq.com/{}.send?text={}&desp={}'.format(SEVER_SCKEY, TEXT, DESP))

    @staticmethod
    def wechat() -> None:
        data = {
            'msgtype': 'text',
            'text': {
                'content': DESP
            }
        }
        headers = {'content-type': 'application/json'}
        requests.post(url=WECHAT_URL, headers=headers, data=json.dumps(data))

    @staticmethod
    def ding() -> None:
        timestamp = str(round(time.time() * 1000))
        secret = DING_SECRET
        secret_enc = secret.encode('utf-8')
        string_to_sign = '{}\n{}'.format(timestamp, secret)
        string_to_sign_enc = string_to_sign.encode('utf-8')
        hmac_code = hmac.new(secret_enc, string_to_sign_enc, digestmod=hashlib.sha256).digest()
        sign = urllib.parse.quote_plus(base64.b64encode(hmac_code))
        headers = {'Content-Type': 'application/json'}
        complete_url = DING_URL + '&timestamp=' + timestamp + "&sign=" + sign
        data = {
            "text": {
                "content": DESP
            },
            "msgtype": "text"
        }
        requests.post(url=complete_url, data=json.dumps(data), headers=headers)


def run() -> None:
    c = CSDN()
    n = Notice()
    c.csdn_sign_in()

    if IF_LUCK_DRAW == 'on':
        c.csdn_luck_draw()
    if IF_SEVER == 'on':
        n.sever()
    if IF_WECHAT == 'on':
        n.wechat()
    if IF_DING == 'on':
        n.ding()


if __name__ == '__main__':
    run()
