# =============================================
# --*-- coding: utf-8 --*--
# @Time    : 2019-10-21
# @Author  : TRHX
# @Blog    : www.itrhx.com
# @CSDN    : https://blog.csdn.net/qq_36759224
# @FileName: bilibili.py
# @Software: PyCharm
# =============================================

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver import ActionChains
import time
import random
from PIL import Image


# 初始化函数
def init():
    global url, browser, username, password, wait
    url = 'https://passport.bilibili.com/login'
    # path是谷歌浏览器驱动的目录，如果已经将目录添加到系统变量，则不用设置此路径
    path = r'F:\PycharmProjects\Python3爬虫\chromedriver.exe'
    chrome_options = Options()
    chrome_options.add_argument('--start-maximized')
    browser = webdriver.Chrome(executable_path=path, chrome_options=chrome_options)
    # 你的哔哩哔哩用户名
    username = '15572414700'
    # 你的哔哩哔哩登录密码
    password = 'TRH12090612'
    wait = WebDriverWait(browser, 20)


# 登录函数
def login():
    browser.get(url)
    # 获取用户名输入框
    user = wait.until(EC.presence_of_element_located((By.ID, 'login-username')))
    # 获取密码输入框
    passwd = wait.until(EC.presence_of_element_located((By.ID, 'login-passwd')))
    # 输入用户名
    user.send_keys(username)
    # 输入密码
    passwd.send_keys(password)
    # 获取登录按钮
    login_btn = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'a.btn.btn-login')))
    # 随机暂停几秒
    time.sleep(random.random() * 3)
    # 点击登陆按钮
    login_btn.click()


# 验证码元素查找函数
def find_element():
    # 获取带有缺口的图片
    c_background = wait.until(
        EC.presence_of_element_located((By.CSS_SELECTOR, 'canvas.geetest_canvas_bg.geetest_absolute')))
    # 获取需要滑动的图片
    c_slice = wait.until(
        EC.presence_of_element_located((By.CSS_SELECTOR, 'canvas.geetest_canvas_slice.geetest_absolute')))
    # 获取完整的图片
    c_full_bg = wait.until(
        EC.presence_of_element_located((By.CSS_SELECTOR, 'canvas.geetest_canvas_fullbg.geetest_fade.geetest_absolute')))
    # 隐藏需要滑动的图片
    hide_element(c_slice)
    # 保存带有缺口的图片
    save_screenshot(c_background, 'back')
    # 显示需要滑动的图片
    show_element(c_slice)
    # 保存需要滑动的图片
    save_screenshot(c_slice, 'slice')
    # 显示完整的图片
    show_element(c_full_bg)
    # 保存完整的图片
    save_screenshot(c_full_bg, 'full')


# 设置元素不可见
def hide_element(element):
    browser.execute_script("arguments[0].style=arguments[1]", element, "display: none;")


# 设置元素可见
def show_element(element):
    browser.execute_script("arguments[0].style=arguments[1]", element, "display: block;")


# 验证码截图函数
def save_screenshot(obj, name):
    try:
        # 首先对出现验证码后的整个页面进行截图保存
        pic_url = browser.save_screenshot('.\\bilibili.png')
        print("%s:截图成功!" % pic_url)
        # 计算传入的obj，也就是三张图片的位置信息
        left = obj.location['x']
        top = obj.location['y']
        right = left + obj.size['width']
        bottom = top + obj.size['height']
        # 打印输出一下每一张图的位置信息
        print('图：' + name)
        print('Left %s' % left)
        print('Top %s' % top)
        print('Right %s' % right)
        print('Bottom %s' % bottom)
        print('')
        # 在整个页面截图的基础上，根据位置信息，分别剪裁出三张验证码图片并保存
        im = Image.open('.\\bilibili.png')
        im = im.crop((left, top, right, bottom))
        file_name = 'bili_' + name + '.png'
        im.save(file_name)
    except BaseException as msg:
        print("%s:截图失败!" % msg)


# 滑动模块的主函数
def slide():
    distance = get_distance(Image.open('.\\bili_back.png'), Image.open('.\\bili_full.png'))
    print('计算偏移量为：%s Px' % distance)
    trace = get_trace(distance - 5)
    move_to_gap(trace)
    time.sleep(3)


# 计算滑块移动距离函数
def get_distance(bg_image, fullbg_image):
    # 滑块的初始位置
    distance = 60
    # 遍历两张图片的每个像素
    for i in range(distance, fullbg_image.size[0]):
        for j in range(fullbg_image.size[1]):
            # 调用缺口位置寻找函数
            if not is_pixel_equal(fullbg_image, bg_image, i, j):
                return i


# 缺口位置寻找函数
def is_pixel_equal(bg_image, fullbg_image, x, y):
    # 获取两张图片对应像素点的RGB数据
    bg_pixel = bg_image.load()[x, y]
    fullbg_pixel = fullbg_image.load()[x, y]
    # 设定一个阈值
    threshold = 60
    # 比较两张图 RGB 的绝对值是否均小于定义的阈值
    if (abs(bg_pixel[0] - fullbg_pixel[0] < threshold) and abs(bg_pixel[1] - fullbg_pixel[1] < threshold) and abs(
            bg_pixel[2] - fullbg_pixel[2] < threshold)):
        return True
    else:
        return False


# 构造移动轨迹函数
def get_trace(distance):
    trace = []
    # 设置加速距离为总距离的4/5
    faster_distance = distance * (4 / 5)
    # 设置初始位置、初始速度、时间间隔
    start, v0, t = 0, 0, 0.1
    while start < distance:
        if start < faster_distance:
            a = 10
        else:
            a = -10
        # 位移
        move = v0 * t + 1 / 2 * a * t * t
        # 当前时刻的速度
        v = v0 + a * t
        v0 = v
        start += move
        trace.append(round(move))
    # trace 记录了每个时间间隔移动了多少位移
    return trace


# 模拟拖动函数
def move_to_gap(trace):
    # 获取滑动按钮
    slider = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'div.geetest_slider_button')))
    # 点击并拖动滑块
    ActionChains(browser).click_and_hold(slider).perform()
    # 遍历运动轨迹获取每小段位移距离
    for x in trace:
        # 移动此位移
        ActionChains(browser).move_by_offset(xoffset=x, yoffset=0).perform()
    time.sleep(0.5)
    # 释放鼠标
    ActionChains(browser).release().perform()


if __name__ == '__main__':
    init()
    login()
    find_element()
    slide()
