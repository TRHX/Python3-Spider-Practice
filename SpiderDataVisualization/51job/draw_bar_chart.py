# ==================================
# --*-- coding: utf-8 --*--
# @Time    : 2020-07-11
# @Author  : TRHX
# @Blog    : www.itrhx.com
# @CSDN    : itrhx.blog.csdn.net
# @FileName: draw_bar_chart.py
# @Software: PyCharm
# ==================================


import pymongo
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt


def processing_data():
    # 连接数据库，从数据库读取数据（也可以导出后从文件中读取）
    client = pymongo.MongoClient(host='localhost', port=27017)
    db = client.job51_spider
    collection = db.data

    # 读取数据并转换为 DataFrame 对象
    data = pd.DataFrame(list(collection.find()))
    data = data[['工资', '经验', '学历']]

    # 使用正则表达式选择空白的字段并填充为缺失值，然后删除带有缺失值的所有行
    data.replace(to_replace=r'^\s*$', value=np.nan, regex=True, inplace=True)
    data = data.dropna()

    # 对工资数据进行清洗，处理后的工作单位：元/月
    data['工资'] = data['工资'].apply(wish_data)
    return data


def wish_data(wages_old):

    """
    数据清洗规则：
    分为元/天，千(以上/下)/月，万(以上/下)/月，万(以上/下)/年
    若数据是一个区间的，则求其平均值，最后的值统一单位为元/月
    """

    if '元/天' in wages_old:
        if '-' in wages_old.split('元')[0]:
            wages1 = wages_old.split('元')[0].split('-')[0]
            wages2 = wages_old.split('元')[0].split('-')[1]
            wages_new = (float(wages2) + float(wages1)) / 2 * 30
        else:
            wages_new = float(wages_old.split('元')[0]) * 30
        return wages_new

    elif '千/月' in wages_old or '千以下/月' in wages_old or '千以上/月' in wages_old:
        if '-' in wages_old.split('千')[0]:
            wages1 = wages_old.split('千')[0].split('-')[0]
            wages2 = wages_old.split('千')[0].split('-')[1]
            wages_new = (float(wages2) + float(wages1)) / 2 * 1000
        else:
            wages_new = float(wages_old.split('千')[0]) * 1000
        return wages_new

    elif '万/月' in wages_old or '万以下/月' in wages_old or '万以上/月' in wages_old:
        if '-' in wages_old.split('万')[0]:
            wages1 = wages_old.split('万')[0].split('-')[0]
            wages2 = wages_old.split('万')[0].split('-')[1]
            wages_new = (float(wages2) + float(wages1)) / 2 * 10000
        else:
            wages_new = float(wages_old.split('万')[0]) * 10000
        return wages_new

    elif '万/年' in wages_old or '万以下/年' in wages_old or '万以上/年' in wages_old:
        if '-' in wages_old.split('万')[0]:
            wages1 = wages_old.split('万')[0].split('-')[0]
            wages2 = wages_old.split('万')[0].split('-')[1]
            wages_new = (float(wages2) + float(wages1)) / 2 * 10000 / 12
        else:
            wages_new = float(wages_old.split('万')[0]) * 10000 / 12
        return wages_new


def wages_experience_chart(data):
    # 根据经验分类，求不同经验对应的平均薪资
    wages_experience = data.groupby('经验').mean()

    # 获取经验和薪资的值，将其作为画图的 x 和 y 数据
    w = wages_experience['工资'].index.values
    e = wages_experience['工资'].values

    # 按照经验对数据重新进行排序，薪资转为 int 类型（也可以直接在前面对 DataFrame 按照薪资大小排序）
    wages = [w[6], w[1], w[2], w[3], w[4], w[5], w[0]]
    experience = [int(e[6]), int(e[1]), int(e[2]), int(e[3]), int(e[4]), int(e[5]), int(e[0])]

    # 绘制柱状图
    plt.rcParams['font.sans-serif'] = ['Microsoft YaHei']
    plt.figure(figsize=(9, 6))
    x = wages
    y = experience
    color = ['#E41A1C', '#377EB8', '#4DAF4A', '#984EA3', '#FF7F00', '#FFFF33', '#A65628']
    plt.bar(x, y, color=color)
    for a, b in zip(x, y):
        plt.text(a, b, b, ha='center', va='bottom')
    plt.title('Python 相关职位经验与平均薪资关系', fontsize=13)
    plt.xlabel('经验', fontsize=13)
    plt.ylabel('平均薪资（元 / 月）', fontsize=13)
    plt.savefig('wages_experience_chart.png')
    plt.show()


def wages_education_chart(data):
    # 根据学历分类，求不同学历对应的平均薪资
    wages_education = data.groupby('学历').mean()

    # 获取学历和薪资的值，将其作为画图的 x 和 y 数据
    wages = wages_education['工资'].index.values
    education = [int(i) for i in wages_education['工资'].values]

    # 绘制柱状图
    plt.rcParams['font.sans-serif'] = ['Microsoft YaHei']
    plt.figure(figsize=(9, 6))
    x = wages
    y = education
    color = ['#E41A1C', '#377EB8', '#4DAF4A']
    plt.bar(x, y, color=color)
    for a, b in zip(x, y):
        plt.text(a, b, b, ha='center', va='bottom')
    plt.title('Python 相关职位学历与平均薪资关系', fontsize=13)
    plt.xlabel('学历', fontsize=13)
    plt.ylabel('平均薪资（元 / 月）', fontsize=13)
    plt.savefig('wages_education_chart.png')
    plt.show()


if __name__ == '__main__':

    """
    processing_data:      数据处理
    wages_experience_bar: 平均薪资与经验关系柱状图
    wages_education_bar:  平均薪资与学历关系柱状图
    """

    job_data = processing_data()
    wages_experience_chart(job_data)
    wages_education_chart(job_data)
