# =============================================
# --*-- coding: utf-8 --*--
# @Time    : 2019-09-23
# @Author  : TRHX
# @Blog    : www.itrhx.com
# @CSDN    : https://blog.csdn.net/qq_36759224
# @FileName: maoyan.py
# @Software: PyCharm
# =============================================

import requests
from lxml import etree
import csv

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36'
}


def index_page(number):
    url = 'https://maoyan.com/board/4?offset=%s' % number
    response = requests.get(url=url, headers=headers)
    return response.text


def parse_page(content):
    tree = etree.HTML(content)
    # 排名
    ranking = tree.xpath("//dd/i/text()")
    # 电影名称
    movie_name = tree.xpath('//p[@class="name"]/a/text()')
    # 主演
    performer = tree.xpath("//p[@class='star']/text()")
    performer = [p.strip() for p in performer]
    # 上映时间
    releasetime = tree.xpath('//p[@class="releasetime"]/text()')
    # 评分
    score1 = tree.xpath('//p[@class="score"]/i[@class="integer"]/text()')
    score2 = tree.xpath('//p[@class="score"]/i[@class="fraction"]/text()')
    score = [score1[i] + score2[i] for i in range(min(len(score1), len(score2)))]
    # 电影封面图
    movie_img = tree.xpath('//img[@class="board-img"]/@data-src')
    # for i in zip(ranking, movie_name, performer, releasetime, score, movie_img):
    #    print(i)
    return zip(ranking, movie_name, performer, releasetime, score, movie_img)


def save_results(result):
    with open('maoyan.csv', 'a') as fp:
        writer = csv.writer(fp)
        writer.writerow(result)


if __name__ == '__main__':
    print('开始爬取数据...')
    for i in range(0, 100, 10):
        index = index_page(i)
        results = parse_page(index)
        for i in results:
            save_results(i)
    print('数据爬取完毕！！')
