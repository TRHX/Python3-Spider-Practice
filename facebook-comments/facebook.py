# ====================================
# --*-- coding: utf-8 --*--
# @Time    : 2021-05-30
# @Author  : TRHX • 鲍勃
# @Blog    : www.itrhx.com
# @CSDN    : itrhx.blog.csdn.net
# @FileName: facebook.py
# @Software: PyCharm
# ====================================


import requests
import json
import time
from lxml import etree


# ==============================  测试链接  ============================== #
# https://www.chinatimes.com/realtimenews/20210529003827-260407
# https://tw.appledaily.com/life/20210530/IETG7L3VMBA57OD45OC5KFTCPQ/
# https://www.nownews.com/news/5281470
# https://www.thejakartapost.com/life/2019/06/03/how-to-lose-belly-fat-in-seven-days.html
# https://mcnews.cc/p/25224
# https://news.ltn.com.tw/news/world/breakingnews/3550262
# https://www.npf.org.tw/1/15857
# https://news.pts.org.tw/article/528425
# https://news.tvbs.com.tw/life/1518745
# ==============================  测试链接  ============================== #


PAGE_URL = 'https://www.chinatimes.com/realtimenews/20210529003827-260407'
PROXIES = {'http': 'http://127.0.0.1:10809', 'https': 'http://127.0.0.1:10809'}
# PROXIES = None # 如果不需要代理则设置为 None


class FacebookComment:
    def __init__(self):
        self.json_name = 'facebook_comments.json'
        self.domain = PAGE_URL.split('/')[2]
        self.iframe_referer = 'https://{}/'.format(self.domain)
        self.user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36'
        self.channel_base_url = 'https%3A%2F%2Fstaticxx.facebook.com%2Fx%2Fconnect%2Fxd_arbiter%2F%3Fversion%3D46%23cb%3Df17861604189654%26domain%3D{}%26origin%3Dhttps%253A%252F%252F{}%252Ff9bd3e89788d7%26relation%3Dparent.parent'
        self.referer_base_url = 'https://www.facebook.com/plugins/feedback.php?app_id={}&channel={}&container_width=924&height=100&href={}&locale=zh_TW&numposts=5&order_by=reverse_time&sdk=joey&version=v3.2&width'
        self.comment_base_url = 'https://www.facebook.com/plugins/comments/async/{}/pager/reverse_time/'
        self.reply_base_url = 'https://www.facebook.com/plugins/comments/async/comment/{}/pager/'
        self.target_id = ''
        self.referer = ''
        self.app_id = ''

    @staticmethod
    def find_value(html: str, key: str, num_chars: int, separator: str) -> str:
        pos_begin = html.find(key) + len(key) + num_chars
        pos_end = html.find(separator, pos_begin)
        return html[pos_begin: pos_end]

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
        headers = {'user-agent': self.user_agent}
        response = requests.get(url=PAGE_URL, headers=headers, proxies=PROXIES)
        html = response.text
        content = etree.HTML(html)
        try:
            app_id = content.xpath('//meta[@property="fb:app_id"]/@content')[0]
            self.app_id = app_id
        except IndexError:
            pass

    def get_first_parameter(self) -> str:
        channel_url = self.channel_base_url.format(self.domain, self.domain)
        referer_url = self.referer_base_url.format(self.app_id, channel_url, PAGE_URL)
        headers = {
            'authority': 'www.facebook.com',
            'upgrade-insecure-requests': '1',
            'user-agent': self.user_agent,
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'sec-fetch-site': 'cross-site',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-dest': 'iframe',
            'referer': self.iframe_referer,
            'accept-language': 'zh-CN,zh;q=0.9'
        }
        response = requests.get(url=referer_url, headers=headers, proxies=PROXIES)
        data = response.text

        after_cursor = self.find_value(data, "afterCursor", 3, separator='"')
        target_id = self.find_value(data, "targetID", 3, separator='"')
        # rev = find_value(data, "consistency", 9, separator='}')

        # 提取并保存最开始的评论
        tree = etree.HTML(data)
        script = tree.xpath('//body/script[last()]/text()')[0]
        html_begin = script.find('"comments":') + len('"comments":')
        html_end = script.find('"meta"')
        result = script[html_begin:html_end].strip()
        result_dict = json.loads(result[:-1])
        comment_type = 'first'
        self.processing_comment(result_dict, comment_type)
        self.target_id = target_id
        self.referer = referer_url
        return after_cursor

    def get_comment(self, after_cursor: str, comment_url: str) -> None:
        """
        :param after_cursor: 字符串，下一页的 cursor
        :param comment_url: 字符串，评论页面的 URL
        :return: None
        """
        num = 1
        while after_cursor:
            post_data = {
                'app_id': self.app_id,
                'after_cursor': after_cursor,
                'limit': 10,
                'iframe_referer': self.iframe_referer,
                '__user': 0,
                '__a': 1,
                '__dyn': '7xe6EgU4e3W3mbG2KmhwRwqo98nwgUbErxW5EyewSwMwyzEdU5i3K1bwOw-wpUe8hwem0nCq1ewbWbwmo62782CwOwKwEwhU1382gKi8wl8G0jx0Fw9q0B82swdK0D83mwkE5G0zE16o',
                '__csr': '',
                '__req': num,
                '__beoa': 0,
                '__pc': 'PHASED:plugin_feedback_pkg',
                'dpr': 1,
                '__ccg': 'GOOD',
                # '__rev': rev,
                # '__s': ':mfgzaz:f4if6y',
                # '__hsi': '6899699958141806572',
                '__comet_req': 0,
                'locale': 'zh_TW',
                # 'jazoest': '22012',
                '__sp': 1
            }
            headers = {
                'user-agent': self.user_agent,
                'content-type': 'application/x-www-form-urlencoded',
                'accept': '*/*',
                'origin': 'https://www.facebook.com',
                'sec-fetch-site': 'same-origin',
                'sec-fetch-mode': 'cors',
                'sec-fetch-dest': 'empty',
                'referer': self.referer,
                'accept-language': 'zh-CN,zh;q=0.9'
            }
            response = requests.post(url=comment_url, headers=headers, proxies=PROXIES, data=post_data)
            data = response.text

            if 'xml version' in data:
                html_data = data.split('\n', 1)[1]
            else:
                html_data = data
            if 'for (;;);' in html_data:
                json_text = html_data.split("for (;;);")[1]
                json_dict = json.loads(json_text)
                # print(json_dict)
                comment_type = 'second'
                self.processing_comment(json_dict, comment_type)
                try:
                    after_cursor = json_dict['payload']['afterCursor']
                except KeyError:
                    after_cursor = False
                # try:
                #     rev = json_dict['hsrp']['hblp']['consistency']['rev']
                # except KeyError:
                #     rev = ''
            else:
                after_cursor = False
            num += 1

    def processing_comment(self, comment_dict: dict, comment_type: str) -> None:
        """
        :param comment_dict: 字典，所有评论信息，不同页面传来的数据可能结构不一样
        :param comment_type: 字符串，用来标记第一页和非第一页的评论
        :return: None
        """
        try:
            comment_dict = comment_dict['payload']
        except KeyError:
            comment_dict = comment_dict

        # 如果为 first，表示是第一页评论，则全部储存，否则要去掉重复的第一个
        if comment_type == 'first':
            comment_ids = comment_dict['commentIDs']
        else:
            comment_ids = comment_dict['commentIDs'][1:]

        # 第一次储存，储存所有一级评论
        self.extract_comment(comment_dict, comment_ids)

    def extract_comment(self, comment_dict: dict, comment_ids: list) -> None:
        """
        :param comment_dict: 字典，所有的评论信息
        :param comment_ids: 列表，所有评论的 ID
        :return: None
        """
        for i in range(len(comment_ids)):

            # ==================  info  ================== #
            crawl_timestamp = int(time.time())
            crawl_time = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())

            # =================  comment  ================ #
            comment = comment_dict['idMap'][comment_ids[i]]
            comment_id = comment_ids[i]
            target_id = comment['targetID']
            created_timestamp = comment['timestamp']['time']
            created_time_text = comment['timestamp']['text']
            created_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(float(created_timestamp)))
            comment_type = comment['type']
            ranges = comment['ranges']
            like_count = comment['likeCount']
            has_liked = comment['hasLiked']
            can_like = comment['canLike']
            can_edit = comment['canEdit']
            hidden = comment['hidden']
            high_lighted_words = comment['highlightedWords']
            spam_count = comment['spamCount']
            can_embed = comment['canEmbed']
            try:
                reply_count = comment['public_replies']['totalCount']
            except KeyError:
                reply_count = 0
            report_uri = 'https://www.facebook.com' + comment['reportURI']
            content = comment['body']['text']

            # =================  author  ================= #
            author_id = comment['authorID']
            author = comment_dict['idMap'][author_id]
            author_name = author['name']
            thumb_src = author['thumbSrc']
            uri = author['uri']
            is_verified = author['isVerified']
            author_type = author['type']

            comment_result_dict = {
                'info': {
                    'pageURL': PAGE_URL,                      # 原始页面链接
                    'crawlTimestamp': crawl_timestamp,        # 爬取时间戳
                    'crawlTime': crawl_time                   # 爬取时间
                },
                'comment': {
                    'type': comment_type,                     # 类型
                    'commentID': comment_id,                  # 评论 ID
                    'targetID': target_id,                    # 目标 ID，若为回复 A 的评论，则其值为 A 的评论 ID
                    'createdTimestamp': created_timestamp,    # 评论时间戳
                    'createdTime': created_time,              # 评论时间
                    'createdTimeText': created_time_text,     # 评论时间（年月日）
                    'likeCount': like_count,                  # 该条评论获得的点赞数
                    'replyCount': reply_count,                # 该条评论下的回复数
                    'spamCount': spam_count,                  # 该条评论被标记为垃圾信息的次数
                    'hasLiked': has_liked,                    # 该条评论是否被你点赞过
                    'canLike': can_like,                      # 该条评论是否可以被点赞
                    'canEdit': can_edit,                      # 该条评论是否可以被编辑
                    'hidden': hidden,                         # 该条评论是否被隐藏
                    'canEmbed': can_embed,                    # 该条评论是否可以被嵌入到其他网页
                    'ranges': ranges,                         # 不知道啥含义
                    'highLightedWords': high_lighted_words,   # 该条评论被高亮的单词
                    'reportURI': report_uri,                  # 举报该条评论的链接
                    'content': content,                       # 该条评论的内容
                },
                'author': {
                    'type': author_type,                      # 类型
                    'authorID': author_id,                    # 该条评论作者的 ID
                    'authorName': author_name,                # 该条评论作者的用户名
                    'isVerified': is_verified,                # 该条评论作者是否已认证过
                    'uri': uri,                               # 该条评论作者的 facebook 主页
                    'thumbSrc': thumb_src                     # 该条评论作者的头像链接
                }
            }

            print(comment_result_dict)
            self.save_comment(self.json_name, json.dumps(comment_result_dict, ensure_ascii=False))

            # 第二次储存，储存所有二级评论(回复别人的评论，且不用点击“更多回复”就能看见的评论)
            # 判断依据，是否存在 commentIDs
            try:
                reply_ids = comment['public_replies']['commentIDs']
                self.extract_comment(comment_dict, reply_ids)
            except KeyError:
                pass

            # 第三次储存，储存所有三级评论(回复别人的评论，但是需要点击“更多回复”才能看见的评论)
            # 判断依据，是否存在 afterCursor
            try:
                reply_after_cursor = comment['public_replies']['afterCursor']
                reply_id = comment_ids[i]
                reply_url = self.reply_base_url.format(reply_id)
                self.get_comment(reply_after_cursor, reply_url)
            except KeyError:
                pass

    def run(self) -> None:
        self.get_app_id()
        after_cursor = self.get_first_parameter()
        if len(after_cursor) < 20:
            print('\n{} 评论采集完毕！'.format(PAGE_URL))
        else:
            comment_url = self.comment_base_url.format(self.target_id)
            self.get_comment(after_cursor, comment_url)
            print('\n{} 评论采集完毕！'.format(PAGE_URL))


if __name__ == '__main__':
    FC = FacebookComment()
    FC.run()
