# =============================================
# --*-- coding: utf-8 --*--
# @Time    : 2019-10-12
# @Author  : TRHX
# @Blog    : www.itrhx.com
# @CSDN    : itrhx.blog.csdn.net
# @FileName: hupu.py
# @Software: PyCharm
# =============================================

import requests
import time
import random
from pymongo import MongoClient
from bs4 import BeautifulSoup


def get_pages(page_url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36'
    }
    response = requests.get(url=page_url, headers=headers)
    page_soup = BeautifulSoup(response.text, 'lxml')
    return page_soup


def parse_pages(page_soup):
    data_list = []
    all_list = page_soup.find('ul', class_='for-list')
    post_list = all_list.find_all('li')
    # print(result_list)
    for post in post_list:
        # 帖子名称
        post_title = post.find('a', class_='truetit').text
        # print(post_title)
        # 帖子链接
        post_url = 'https://bbs.hupu.com' + post.find('a', class_='truetit')['href']
        # print(post_url)
        # 作者
        author = post.select('.author > a')[0].text
        # print(author)
        # 作者主页
        author_url = post.select('.author > a')[0]['href']
        # print(author_url)
        # 发布日期
        post_date = post.select('.author > a')[1].text
        # print(post_date)
        reply_view = post.find('span', class_='ansour').text
        # 回复数
        post_reply = reply_view.split('/')[0].strip()
        # print(post_reply)
        # 浏览量
        post_view = reply_view.split('/')[1].strip()
        # print(post_view)
        # 最后回复时间
        last_data = post.select('.endreply > a')[0].text
        # print(last_data)
        # 最后回复用户
        last_user = post.select('.endreply > span')[0].text
        # print(last_user)

        data_list.append([post_title, post_url, author, author_url, post_date, post_reply, post_view, last_data, last_user])

    # print(data_list)
    return data_list


def mongodb(data_list):
    client = MongoClient('localhost', 27017)
    db = client.hupu
    collection = db.bxj
    for data in data_list:
        bxj = {
            '帖子名称': data[0],
            '帖子链接': data[1],
            '作者': data[2],
            '作者主页': data[3],
            '发布日期': str(data[4]),
            '回复数': data[5],
            '浏览量': data[6],
            '最后回复时间': str(data[7]),
            '最后回复用户': data[8]
        }
        collection.insert_one(bxj)


if __name__ == '__main__':
    for i in range(1, 11):
        url = 'https://bbs.hupu.com/bxj-' + str(i)
        soup = get_pages(url)
        result_list = parse_pages(soup)
        mongodb(result_list)
        print('第', i, '页数据爬取完毕！')
        time.sleep(random.randint(3, 10))
    print('前10页所有数据爬取完毕！')
