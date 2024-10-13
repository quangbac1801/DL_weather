from datetime import datetime
from django.http import JsonResponse
from django.shortcuts import render
import pandas as pd
import os

base_dir = os.path.dirname(os.path.abspath(__file__)) 

media_dir = os.path.join(base_dir, 'media')

thoitiet_path = os.path.join(media_dir, 'dulieududoan.csv')
province_data_path = os.path.join(media_dir, 'province_map.csv')

thoitiet = pd.read_csv(thoitiet_path)
province_data = pd.read_csv(province_data_path)

def index(request):
    return render(request,"index.html")

def get_weather(request, code):
    try:
        province = province_data.loc[province_data['adm1_pcode'] == code, 'province'].values[0]
        date = datetime.now().strftime('%Y-%m-%d')
        thongtin_thoitiet = thoitiet[(thoitiet['province'] == province) & (thoitiet['date'] == date)]
        if not thongtin_thoitiet.empty:
            weather_data = {
                'adm1_en': province, 
                'max': thongtin_thoitiet['max'].values[0],
                'min': thongtin_thoitiet['min'].values[0],
                'wind': thongtin_thoitiet['wind'].values[0],
                'rain': thongtin_thoitiet['rain'].values[0],
                'humidi': thongtin_thoitiet['humidi'].values[0],
                'cloud': thongtin_thoitiet['cloud'].values[0],
                'date': thongtin_thoitiet['date'].values[0],
                'adm1_pcode': code
            }

            return JsonResponse([weather_data], safe=False)  
        else:
            return JsonResponse({'error': 'No data available for this province'}, status=404)

    except IndexError:
        return JsonResponse({'error': 'Invalid province code'}, status=400)

