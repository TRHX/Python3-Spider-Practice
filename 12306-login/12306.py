# =============================================
# --*-- coding: utf-8 --*--
# @Time    : 2019-10-21
# @Author  : TRHX
# @Blog    : www.itrhx.com
# @CSDN    : https://blog.csdn.net/qq_36759224
# @FileName: 12306.py
# @Software: PyCharm
# =============================================

import time
from io import BytesIO
from PIL import Image
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver import ActionChains
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from chaojiying import ChaojiyingClient
from selenium.common.exceptions import TimeoutException

# 12306账号密码
USERNAME = '155********'
PASSWORD = '***********'

# 超级鹰打码平台账号密码
CHAOJIYING_USERNAME = '********'
CHAOJIYING_PASSWORD = '********'

# 超级鹰打码平台软件ID
CHAOJIYING_SOFT_ID = '*****'
# 验证码类型
CHAOJIYING_KIND = '9004'


class CrackTouClick():
    def __init__(self):
        self.url = 'https://kyfw.12306.cn/otn/resources/login.html'
        # path是谷歌浏览器驱动的目录，如果已经将目录添加到系统变量，则不用设置此路径
        path = r'F:\PycharmProjects\Python3爬虫\chromedriver.exe'
        chrome_options = Options()
        chrome_options.add_argument('--start-maximized')
        self.browser = webdriver.Chrome(executable_path=path, chrome_options=chrome_options)
        self.wait = WebDriverWait(self.browser, 20)
        self.username = USERNAME
        self.password = PASSWORD
        self.chaojiying = ChaojiyingClient(CHAOJIYING_USERNAME, CHAOJIYING_PASSWORD, CHAOJIYING_SOFT_ID)

    def crack(self):
        # 调用账号密码输入函数
        self.get_input_element()
        # 调用验证码图片剪裁函数
        image = self.get_touclick_image()
        bytes_array = BytesIO()
        image.save(bytes_array, format='PNG')
        # 利用超级鹰打码平台的 API PostPic() 方法把图片发送给超级鹰后台，发送的图像是字节流格式，返回的结果是一个JSON
        result = self.chaojiying.PostPic(bytes_array.getvalue(), CHAOJIYING_KIND)
        print(result)
        # 调用验证码坐标解析函数
        locations = self.get_points(result)
        # 调用模拟点击验证码函数
        self.touch_click_words(locations)
        # 调用模拟点击登录函数
        self.login()
        try:
            # 查找是否出现用户的姓名，若出现表示登录成功
            success = self.wait.until(EC.text_to_be_present_in_element((By.CSS_SELECTOR, '.welcome-name'), '谭先生'))
            print(success)
            cc = self.browser.find_element(By.CSS_SELECTOR, '.welcome-name')
            print('用户' + cc.text + '登录成功')
            # 若没有出现表示登录失败，继续重试，超级鹰会返回本次识别的分值
        except TimeoutException:
            self.chaojiying.ReportError(result['pic_id'])
            self.crack()

    # 账号密码输入函数
    def get_input_element(self):
        # 登录页面发送请求
        self.browser.get(self.url)
        # 登录页面默认是扫码登录，所以首先要点击账号登录
        login = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, '.login-hd-account')))
        login.click()
        time.sleep(3)
        # 查找到账号密码输入位置的元素
        username = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'input#J-userName')))
        password = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'input#J-password')))
        # 输入账号密码
        username.send_keys(self.username)
        password.send_keys(self.password)

    # 验证码图片剪裁函数
    def get_touclick_image(self, name='12306.png'):
        # 获取验证码的位置
        element = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, '.login-pwd-code')))
        time.sleep(3)
        location = element.location
        size = element.size
        top, bottom, left, right = location['y'], location['y'] + size['height'], location['x'], location['x'] + size[
            'width']
        # 先对整个页面截图
        screenshot = self.browser.get_screenshot_as_png()
        screenshot = Image.open(BytesIO(screenshot))
        # 根据验证码坐标信息，剪裁出验证码图片
        captcha = screenshot.crop((left, top, right, bottom))
        captcha.save(name)
        return captcha

    # 验证码坐标解析函数，分析超级鹰返回的坐标
    def get_points(self, captcha_result):
        # 超级鹰识别结果以字符串形式返回，每个坐标都以|分隔
        groups = captcha_result.get('pic_str').split('|')
        # 将坐标信息变成列表的形式
        locations = [[int(number) for number in group.split(',')] for group in groups]
        return locations

    # 模拟点击验证码函数
    def touch_click_words(self, locations):
        element = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, '.login-pwd-code')))
        # 循环点击正确验证码的坐标
        for location in locations:
            print(location)
            ActionChains(self.browser).move_to_element_with_offset(element, location[0], location[1]).click().perform()

    # 模拟点击登录函数
    def login(self):
        submit = self.wait.until(EC.element_to_be_clickable((By.ID, 'J-login')))
        submit.click()


if __name__ == '__main__':
    crack = CrackTouClick()
    crack.crack()
