# ==================================
# --*-- coding: utf-8 --*--
# @Time    : 2021-08-02
# @Author  : TRHX
# @Blog    : www.itrhx.com
# @CSDN    : itrhx.blog.csdn.net
# @FileName: unicom_trip.py
# @Software: PyCharm
# ==================================


import execjs
import requests


# 流入
source_top_url = 'https://unicom_trip.133.cn/api/v1/city/source-top/%s?date=%s'
flight_route_arr_url = 'https://unicom_trip.133.cn/api/v1/city/flight-route/%s?date=%s&type=arr'
train_route_arr_url = 'https://unicom_trip.133.cn/api/v1/city/train-route/%s?date=%s&type=arr'

# 流出
trip_top_url = 'https://unicom_trip.133.cn/api/v1/city/trip-top/%s?date=%s'
flight_route_dep_url = 'https://unicom_trip.133.cn/api/v1/city/flight-route/%s?date=%s&type=dep'
train_route_dep_url = 'https://unicom_trip.133.cn/api/v1/city/train-route/%s?date=%s&type=dep'

all_url = [
    source_top_url, flight_route_arr_url, train_route_arr_url,
    trip_top_url, flight_route_dep_url, train_route_dep_url
]


def get_encrypted_data(city, date):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Mobile Safari/537.36'
    }
    encrypted_data = []
    for u in all_url:
        data = requests.get(url=u % (city, date), headers=headers).text
        encrypted_data.append(data)
    return encrypted_data


def get_decrypted_data(encrypted_data):
    with open('unicom_trip_decrypt.js', 'r', encoding='utf-8') as f:
        unicom_trip_133_cn_js = f.read()
    all_encrypted_data = []
    for d in encrypted_data:
        data = execjs.compile(unicom_trip_133_cn_js).call('dataDecode', d)
        all_encrypted_data.append(data)
    return all_encrypted_data


def main():
    """
    城市可以输入汉字，也可以输入城市代码
    城市代码：https://unicom_trip.133.cn/api/v1/province-all，同样需要解密处理
    """
    city = '北京市'
    date = '20210713'
    encrypted_data = get_encrypted_data(city, date)
    decrypted_data = get_decrypted_data(encrypted_data)
    print('查询城市: ', city)
    print('流入来源城市: ', decrypted_data[0])
    print('流入方向飞机路线: ', decrypted_data[1])
    print('流入方向火车路线: ', decrypted_data[2])
    print('流出方向线路: ', decrypted_data[3])
    print('流出方向飞机路线: ', decrypted_data[4])
    print('流出方向火车路线: ', decrypted_data[5])


if __name__ == '__main__':
    main()

