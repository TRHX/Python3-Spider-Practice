# =============================================
# --*-- coding: utf-8 --*--
# @Time    : 2019-10-21
# @Author  : TRHX
# @Blog    : www.itrhx.com
# @CSDN    : itrhx.blog.csdn.net
# @FileName: 58tongcheng.py
# @Software: PyCharm
# =============================================

import requests
import time
import random
import base64
import pymysql
from lxml import etree
from bs4 import BeautifulSoup
from fontTools.ttLib import TTFont

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36'
}


# 获取字体文件并转换为xml文件
def get_font(page_url, page_num):
    response = requests.get(url=page_url, headers=headers)
    # 匹配 base64 编码的加密字体字符串
    base64_string = response.text.split("base64,")[1].split("'")[0].strip()
    # print(base64_string)
    # 将 base64 编码的字体字符串解码成二进制编码
    bin_data = base64.decodebytes(base64_string.encode())
    # 保存为字体文件
    with open('58font.woff', 'wb') as f:
        f.write(bin_data)
    print('第' + str(page_num) + '次访问网页，字体文件保存成功！')
    # 获取字体文件，将其转换为xml文件
    font = TTFont('58font.woff')
    font.saveXML('58font.xml')
    print('已成功将字体文件转换为xml文件！')
    return response.text


# 将加密字体编码与真实字体进行匹配
def find_font():
    # 以glyph开头的编码对应的数字
    glyph_list = {
        'glyph00001': '0',
        'glyph00002': '1',
        'glyph00003': '2',
        'glyph00004': '3',
        'glyph00005': '4',
        'glyph00006': '5',
        'glyph00007': '6',
        'glyph00008': '7',
        'glyph00009': '8',
        'glyph00010': '9'
    }
    # 十个加密字体编码
    unicode_list = ['0x9476', '0x958f', '0x993c', '0x9a4b', '0x9e3a', '0x9ea3', '0x9f64', '0x9f92', '0x9fa4', '0x9fa5']
    num_list = []
    # 利用xpath语法匹配xml文件内容
    font_data = etree.parse('./58font.xml')
    for unicode in unicode_list:
        # 依次循环查找xml文件里code对应的name
        result = font_data.xpath("//cmap//map[@code='{}']/@name".format(unicode))[0]
        # print(result)
        # 循环字典的key，如果code对应的name与字典的key相同，则得到key对应的value
        for key in glyph_list.keys():
            if key == result:
                num_list.append(glyph_list[key])
    print('已成功找到编码所对应的数字！')
    # print(num_list)
    # 返回value列表
    return num_list


# 替换掉网页中所有的加密字体编码
def replace_font(num, page_response):
    # 9476 958F 993C 9A4B 9E3A 9EA3 9F64 9F92 9FA4 9FA5
    result = page_response.replace('&#x9476;', num[0]).replace('&#x958f;', num[1]).replace('&#x993c;', num[2]).replace('&#x9a4b;', num[3]).replace('&#x9e3a;', num[4]).replace('&#x9ea3;', num[5]).replace('&#x9f64;', num[6]).replace('&#x9f92;', num[7]).replace('&#x9fa4;', num[8]).replace('&#x9fa5;', num[9])
    print('已成功将所有加密字体替换！')
    return result


# 提取租房信息
def parse_pages(pages):
    num = 0
    soup = BeautifulSoup(pages, 'lxml')
    # 查找到包含所有租房的li标签
    all_house = soup.find_all('li', class_='house-cell')
    for house in all_house:
        # 标题
        title = house.find('a', class_='strongbox').text.strip()
        # print(title)

        # 价格
        price = house.find('div', class_='money').text.strip()
        # print(price)

        # 户型和面积
        layout = house.find('p', class_='room').text.replace(' ', '')
        # print(layout)

        # 楼盘和地址
        address = house.find('p', class_='infor').text.replace(' ', '').replace('\n', '')
        # print(address)

        # 如果存在经纪人
        if house.find('div', class_='jjr'):
            agent = house.find('div', class_='jjr').text.replace(' ', '').replace('\n', '')
        # 如果存在品牌公寓
        elif house.find('p', class_='gongyu'):
            agent = house.find('p', class_='gongyu').text.replace(' ', '').replace('\n', '')
        # 如果存在个人房源
        else:
            agent = house.find('p', class_='geren').text.replace(' ', '').replace('\n', '')
        # print(agent)

        data = [title, price, layout, address, agent]
        save_to_mysql(data)
        num += 1
        print('第' + str(num) + '条数据爬取完毕，暂停3秒！')
        time.sleep(3)


# 创建MySQL数据库的表：58tc_data
def create_mysql_table():
    db = pymysql.connect(host='localhost', user='root', password='000000', port=3306, db='58tc_spiders')
    cursor = db.cursor()
    sql = 'CREATE TABLE IF NOT EXISTS 58tc_data (title VARCHAR(255) NOT NULL, price VARCHAR(255) NOT NULL, layout VARCHAR(255) NOT NULL, address VARCHAR(255) NOT NULL, agent VARCHAR(255) NOT NULL)'
    cursor.execute(sql)
    db.close()


# 将数据储存到MySQL数据库
def save_to_mysql(data):
    db = pymysql.connect(host='localhost', user='root', password='000000', port=3306, db='58tc_spiders')
    cursor = db.cursor()
    sql = 'INSERT INTO 58tc_data(title, price, layout, address, agent) values(%s, %s, %s, %s, %s)'
    try:
        cursor.execute(sql, (data[0], data[1], data[2], data[3], data[4]))
        db.commit()
    except:
        db.rollback()
    db.close()


if __name__ == '__main__':
    create_mysql_table()
    print('MySQL表58tc_data创建成功！')
    for i in range(1, 71):
        url = 'https://wh.58.com/chuzu/pn' + str(i) + '/'
        response = get_font(url, i)
        num_list = find_font()
        pro_pages = replace_font(num_list, response)
        parse_pages(pro_pages)
        print('第' + str(i) + '页数据爬取完毕！')
        time.sleep(random.randint(3, 60))
    print('所有数据爬取完毕！')
