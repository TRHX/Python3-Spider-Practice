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


CSDN_ID = ''         # 你的 CSDN ID
COOKIE = ''          # 你的 cookie
IF_LUCK_DRAW = True  # 是否开启抽奖


class CSDN:
    def __init__(self) -> None:
        self.UUID = COOKIE.split(';', 1)[0].split('=', 1)[1]
        self.USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.72 Safari/537.36'
        self.SIGN_IN_URL = 'https://me.csdn.net/api/LuckyDraw_v2/signIn'
        self.LUCKY_DRAW_URL = 'https://me.csdn.net/api/LuckyDraw_v2/goodLuck'
        self.DRAW_TIMES = 0  # 可抽奖次数
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
                print('签到成功！你已连续签到 {} 天，累计签到 {} 天，当前已有 {} 人签到。'.format(keep_count, total_count, total_signed_count))
            elif result['data']['isSigned']:
                print('你今天已经签到过了哟！')
            else:
                print('签到失败！')
        elif result['code'] == 400102:
            print('签到失败！{} 用户不存在或者 cookie 错误！请检查 CSDN ID 或尝试重置 cookie！'.format(CSDN_ID))
        else:
            print('签到失败！')

    def csdn_luck_draw(self) -> None:
        if self.DRAW_TIMES != 0:
            response = requests.post(url=self.LUCKY_DRAW_URL, headers=self.HEADERS, data=self.DATA)
            result = json.loads(response.text)
            # print(result)

            if result['code'] == 200:
                if result['data']['can_draw']:
                    prize_title = result['data']['prize_title']
                    print('抽奖成功！恭喜你获得{}'.format(prize_title))
                elif not result['data']['can_draw']:
                    print('抽奖机会已经用完了哟！')
                else:
                    print('抽奖失败！')
            elif result['code'] == 400102:
                print('抽奖失败！{} 用户不存在或者 cookie 错误！请检查 CSDN ID 或尝试重置 cookie！'.format(CSDN_ID))
            else:
                print('抽奖失败！')


def run() -> None:
    c = CSDN()
    c.csdn_sign_in()
    if IF_LUCK_DRAW:
        c.csdn_luck_draw()


if __name__ == '__main__':
    run()
