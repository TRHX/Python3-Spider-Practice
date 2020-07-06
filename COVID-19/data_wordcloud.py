# =============================================
# --*-- coding: utf-8 --*--
# @Time    : 2020-07-06
# @Author  : TRHX
# @Blog    : www.itrhx.com
# @CSDN    : itrhx.blog.csdn.net
# @FileName: data_wordcloud.py
# @Software: PyCharm
# =============================================

import openpyxl
import wordcloud


def china_wordcloud():
    wb = openpyxl.load_workbook('COVID-19-China.xlsx')  # 获取已有的xlsx文件
    ws_china = wb['中国省份疫情数据']                     # 获取中国省份疫情数据表
    ws_china.delete_rows(1)                             # 删除第一行
    china_dict = {}                                     # 将省份及其累计确诊按照键值对形式储存在字典中
    for data in ws_china.values:
        china_dict[data[0]] = int(data[2])
    word_cloud = wordcloud.WordCloud(font_path='C:/Windows/Fonts/simsun.ttc',
                                     background_color='#CDC9C9',
                                     min_font_size=15,
                                     width=900, height=500)
    word_cloud.generate_from_frequencies(china_dict)
    word_cloud.to_file('WordCloud-China.png')
    print('中国省份疫情词云图绘制完毕！')


def global_wordcloud():
    wb = openpyxl.load_workbook('COVID-19-Global.xlsx')
    ws_global = wb['全球各国疫情数据']
    ws_global.delete_rows(1)
    global_dict = {}
    for data in ws_global.values:
        global_dict[data[0]] = int(data[2])
    word_cloud = wordcloud.WordCloud(font_path='C:/Windows/Fonts/simsun.ttc',
                                     background_color='#CDC9C9',
                                     width=900, height=500)
    word_cloud.generate_from_frequencies(global_dict)
    word_cloud.to_file('WordCloud-Global.png')
    print('全球各国疫情词云图绘制完毕！')


if __name__ == '__main__':

    """
    china_wordcloud: 中国累计确诊词云图
    global_wordcloud: 全球累计确诊词云图
    """

    china_wordcloud()
    global_wordcloud()
