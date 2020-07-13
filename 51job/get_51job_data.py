# ==================================
# --*-- coding: utf-8 --*--
# @Time    : 2020-07-11
# @Author  : TRHX
# @Blog    : www.itrhx.com
# @CSDN    : itrhx.blog.csdn.net
# @FileName: get_51job_data.py
# @Software: PyCharm
# ==================================


import re
import time
import copy
import pymongo
import requests
from lxml import etree


class JobSpider:
    def __init__(self):
        self.base_url = 'https://search.51job.com/list/000000,000000,0000,00,9,99,%s,2,%s.html'
        self.headers = {'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.13 Safari/537.36'}
        self.keyword = input('请输入关键字：')

    def tatal_url(self):
        url = self.base_url % (self.keyword, str(1))
        response = requests.get(url=url, headers=self.headers)
        tree = etree.HTML(response.content.decode('gbk'))
        # 提取一共有多少页
        text = tree.xpath("//div[@class='p_in']/span[1]/text()")[0]
        number = re.findall('[0-9]', text)
        number = int(''.join(number))
        print('%s职位共有%d页' % (self.keyword, number))
        return number

    def detail_url(self, number):

        """
        1、解析每一页职位详情页的 url
        2、特殊情况一：如果有前程无忧自己公司的职位招聘信息掺杂在里面，他的详情页结构和普通的也不一样，页面编码也有差别。
           页面示例：https://51rz.51job.com/job.html?jobid=115980776
           页面真实数据请求地址类似于：https://coapi.51job.com/job_detail.php?jsoncallback=&key=&sign=params={"jobid":""}
           请求地址中的各参数值通过 js 加密：https://js.51jobcdn.com/in/js/2018/coapi/coapi.min.js
        3、特殊情况二：部分公司有自己的专属页面，此类页面的结构也不同于普通页面
           页面示例：http://dali.51ideal.com/jobdetail.html?jobid=121746338
        4、为了规范化，本次爬取将去掉这部分特殊页面，仅爬取 url 带有 jobs.51job.com 的数据
        """

        for num in range(1, number+1):
            url = self.base_url % (self.keyword, str(num))
            response = requests.get(url=url, headers=self.headers)
            tree = etree.HTML(response.content.decode('gbk'))
            detail_url1 = tree.xpath("//div[@class='dw_table']/div[@class='el']/p/span/a/@href")

            """
            深拷贝一个 url 列表，如果有连续的不满足要求的链接，若直接在原列表里面删除，
            则会漏掉一些链接，因为每次删除后的索引已改变，因此在原列表中提取不符合元素
            后，在深拷贝的列表里面进行删除。最后深拷贝的列表里面的元素均符合要求。
            """

            detail_url2 = copy.deepcopy(detail_url1)
            for url in detail_url1:
                if 'jobs.51job.com' not in url:
                    detail_url2.remove(url)
            self.parse_data(detail_url2)
            print('第%d页数据爬取完毕！' % num)
            time.sleep(2)
        print('所有数据爬取完毕！')

    def parse_data(self, urls):

        """
        position:            职位
        wages:               工资
        region:              地区
        experience:          经验
        education:           学历
        need_people:         招聘人数
        publish_date:        发布时间
        english:             英语要求
        welfare_tags:        福利标签
        job_information:     职位信息
        work_address:        上班地址
        company_name:        公司名称
        company_nature:      公司性质
        company_scale:       公司规模
        company_industry:    公司行业
        company_information: 公司信息
        """

        for url in urls:
            response = requests.get(url=url, headers=self.headers)
            try:
                text = response.content.decode('gbk')
            except UnicodeDecodeError:
                return
            tree = etree.HTML(text)

            """
            提取内容时使用 join 方法将列表转为字符串，而不是直接使用索引取值，
            这样做的好处是遇到某些没有的信息直接留空而不会报错
            """

            position = ''.join(tree.xpath("//div[@class='cn']/h1/text()"))
            wages = ''.join(tree.xpath("//div[@class='cn']/strong/text()"))

            # 经验、学历、招聘人数、发布时间等信息都在一个标签里面，逐一使用列表解析式提取
            content = tree.xpath("//div[@class='cn']/p[2]/text()")
            content = [i.strip() for i in content]
            if content:
                region = content[0]
            else:
                region = ''
            experience = ''.join([i for i in content if '经验' in i])
            education = ''.join([i for i in content if i in '本科大专应届生在校生硕士'])
            need_people = ''.join([i for i in content if '招' in i])
            publish_date = ''.join([i for i in content if '发布' in i])
            english = ''.join([i for i in content if '英语' in i])

            welfare_tags = ','.join(tree.xpath("//div[@class='jtag']/div//text()")[1:-2])
            job_information = ''.join(tree.xpath("//div[@class='bmsg job_msg inbox']/p//text()")).replace(' ', '')
            work_address = ''.join(tree.xpath("//div[@class='bmsg inbox']/p//text()"))
            company_name = ''.join(tree.xpath("//div[@class='tCompany_sidebar']/div[1]/div[1]/a/p/text()"))
            company_nature = ''.join(tree.xpath("//div[@class='tCompany_sidebar']/div[1]/div[2]/p[1]//text()"))
            company_scale = ''.join(tree.xpath("//div[@class='tCompany_sidebar']/div[1]/div[2]/p[2]//text()"))
            company_industry = ''.join(tree.xpath("//div[@class='tCompany_sidebar']/div[1]/div[2]/p[3]/@title"))
            company_information = ''.join(tree.xpath("//div[@class='tmsg inbox']/text()"))

            job_data = [position, wages, region, experience, education, need_people, publish_date,
                        english, welfare_tags, job_information, work_address, company_name,
                        company_nature, company_scale, company_industry, company_information]

            save_mongodb(job_data)


def save_mongodb(data):
    client = pymongo.MongoClient(host='localhost', port=27017)
    db = client.job51_spider
    collection = db.data
    save_data = {
        '职位': data[0],
        '工资': data[1],
        '地区': data[2],
        '经验': data[3],
        '学历': data[4],
        '招聘人数': data[5],
        '发布时间': data[6],
        '英语要求': data[7],
        '福利标签': data[8],
        '职位信息': data[9],
        '上班地址': data[10],
        '公司名称': data[11],
        '公司性质': data[12],
        '公司规模': data[13],
        '公司行业': data[14],
        '公司信息': data[15]
    }
    collection.insert_one(save_data)


if __name__ == '__main__':
    spider = JobSpider()
    page_number = spider.tatal_url()
    spider.detail_url(page_number)
