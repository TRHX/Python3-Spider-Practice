# ====================================
# --*-- coding: utf-8 --*--
# @Time    : 2021-05-31
# @Author  : TRHX • 鲍勃
# @Blog    : www.itrhx.com
# @CSDN    : itrhx.blog.csdn.net
# @FileName: vuukle.py
# @Software: PyCharm
# ====================================


import re
import json
import random
import requests
from urllib import parse


# ==============================  测试链接  ============================== #
# https://newsinfo.inquirer.net/1438710/two-aging-red-leaders-slain
# https://www.manilatimes.net/2021/05/29/opinion/columns/why-grand-plan-to-vaccinate-the-world-vs-covid-unraveled/1801049
# ==============================  测试链接  ============================== #


PAGE_URL = 'https://newsinfo.inquirer.net/1438710/two-aging-red-leaders-slain'
PROXIES = {'http': 'http://127.0.0.1:10809', 'https': 'http://127.0.0.1:10809'}
# PROXIES = None # 如果不需要代理则设置为 None


class VuukleComment:
    def __init__(self):
        self.api_key = ''
        self.start = 0
        self.json_name = 'vuukle_comments.json'
        self.host = PAGE_URL.split('/')[2].replace('www.', '')
        self.article_id = re.findall(r'/(\d{5,7})', PAGE_URL)[0]
        self.comment_api_url = 'https://api.vuukle.com/api/v1/Comments/getCommentFeedBySort?'

    @staticmethod
    def find_value_form_html(html: str, key: str, num_chars: int, separator) -> str:
        key_begin = html.find(key) + len(key) + num_chars
        key_end = html.find(separator, key_begin)
        return html[key_begin: key_end]

    @staticmethod
    def get_random_ua() -> str:
        return "Mozilla/5.0 (Windows NT {}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{} Safari/537.36".format(
            random.choice([
                '10.0; Win64; x64', '10.0; WOW64', '10.0',
                '6.2; WOW64', '6.2; Win64; x64', '6.2',
                '6.1', '6.1; Win64; x64', '6.1; WOW64'
            ]), random.choice([
                '70.0.3538.16', '70.0.3538.67', '70.0.3538.97', '71.0.3578.137', '71.0.3578.30', '71.0.3578.33',
                '71.0.3578.80', '72.0.3626.69', '72.0.3626.7', '73.0.3683.20', '73.0.3683.68', '74.0.3729.6',
                '75.0.3770.140', '75.0.3770.8', '75.0.3770.90', '76.0.3809.12', '76.0.3809.126', '76.0.3809.25',
                '76.0.3809.68', '77.0.3865.10', '77.0.3865.40', '78.0.3904.105', '78.0.3904.11', '78.0.3904.70',
                '79.0.3945.16', '79.0.3945.36', '80.0.3987.106', '80.0.3987.16', '81.0.4044.138', '81.0.4044.20',
                '81.0.4044.69', '83.0.4103.14', '83.0.4103.39', '84.0.4147.30', '85.0.4183.38', '85.0.4183.83',
                '85.0.4183.87', '86.0.4240.22', '87.0.4280.20', '87.0.4280.88', '88.0.4324.27'
            ]))

    @staticmethod
    def save_comment(filename: str, information: json) -> None:
        """
        :param filename: 字符串，储存文件名
        :param information: JSON，储存的内容
        :return: None
        """
        with open(filename, 'a+', encoding='utf-8') as f:
            f.write(information + '\n')

    def get_app_id(self) -> None:
        headers = {'User-Agent': self.get_random_ua()}
        response = requests.get(url=PAGE_URL, headers=headers, proxies=PROXIES)
        html = response.text
        api_key = self.find_value_form_html(html, "apiKey", 3, '"')
        self.api_key = api_key

    def get_comment(self) -> None:
        flag = True
        while flag:
            url_parameter = {
                'apiKey': self.api_key,
                'articleId': self.article_id,
                'host': self.host,
                'pageSize': 25,
                'sortBy': 'get_latest',
                'start': self.start
            }
            comment_url = self.comment_api_url + parse.urlencode(url_parameter)
            headers = {'user-agent': self.get_random_ua()}
            response = requests.get(url=comment_url, headers=headers, proxies=PROXIES)
            comment_dict = json.loads(response.text)
            comment_data = comment_dict['data']['comments']['items']
            self.start += comment_dict['data']['comments']['pageSize']
            for comment in comment_data:
                print(comment)
                self.save_comment(self.json_name, json.dumps(comment, ensure_ascii=False))
            if len(comment_data) != 0:
                flag = True
            else:
                flag = False

    def run(self) -> None:
        self.get_app_id()
        self.get_comment()
        print('\n{} 评论采集完毕！'.format(PAGE_URL))


if __name__ == '__main__':
    VC = VuukleComment()
    VC.run()
