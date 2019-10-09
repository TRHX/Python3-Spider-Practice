# ==========================
# --*-- coding: utf-8 --*--
# @Time    : 2019-10-09
# @Author  : TRHX
# @Blog    : www.itrhx.com
# @FileName: anjuke.py
# @Software: PyCharm
# ==========================

import requests
import time
import csv
import random
from bs4 import BeautifulSoup

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36'
}


def parse_pages(url, num):
    response = requests.get(url=url, headers=headers)
    soup = BeautifulSoup(response.text, 'lxml')
    result_list = soup.find_all('li', class_='list-item')
    # print(len(result_list))
    for result in result_list:
        # 标题
        title = result.find('a', class_='houseListTitle').text.strip()
        # print(title)
        # 户型
        layout = result.select('.details-item > span')[0].text
        # print(layout)
        # 面积
        cover = result.select('.details-item > span')[1].text
        # print(cover)
        # 楼层
        floor = result.select('.details-item > span')[2].text
        # print(floor)
        # 建造年份
        year = result.select('.details-item > span')[3].text
        # print(year)
        # 单价
        unit_price = result.find('span', class_='unit-price').text.strip()
        # print(unit_price)
        # 总价
        total_price = result.find('span', class_='price-det').text.strip()
        # print(total_price)
        # 关键字
        keyword = result.find('div', class_='tags-bottom').text.strip()
        # print(keyword)
        # 地址
        address = result.find('span', class_='comm-address').text.replace(' ', '').replace('\n', '')
        # print(address)
        # 详情页url
        details_url = result.find('a', class_='houseListTitle')['href']
        # print(details_url)
        results = [title, layout, cover, floor, year, unit_price, total_price, keyword, address, details_url]
        with open('anjuke.csv', 'a', newline='', encoding='utf-8-sig') as f:
            w = csv.writer(f)
            w.writerow(results)

    # 判断是否还有下一页
    next_url = soup.find_all('a', class_='aNxt')
    if len(next_url) != 0:
        num += 1
        print('第' + str(num) + '页数据爬取完毕！')
        # 3-60秒之间随机暂停
        time.sleep(random.randint(3, 60))
        parse_pages(next_url[0].attrs['href'], num)
    else:
        print('所有数据爬取完毕！')


if __name__ == '__main__':
    with open('anjuke.csv', 'a', newline='', encoding='utf-8-sig') as fp:
        writer = csv.writer(fp)
        writer.writerow(['标题', '户型', '面积', '楼层', '建造年份', '单价', '总价', '关键字', '地址', '详情页地址'])
    start_num = 0
    start_url = 'https://wuhan.anjuke.com/sale/'
    parse_pages(start_url, start_num)
