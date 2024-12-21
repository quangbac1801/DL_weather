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
                'date': str(thongtin_thoitiet['date'].values[0]), 
                'adm1_pcode': code
            }

            return JsonResponse([weather_data], safe=False)  
        else:
            return JsonResponse({'error': 'No data available for this province'}, status=404)

    except IndexError:
        return JsonResponse({'error': 'Invalid province code'}, status=400)

def get_provinces():
    return thoitiet['province'].unique()

# Trang hiển thị thời tiết
def weather_view(request):
    provinces = get_provinces()
    return render(request, 'weather.html', {'provinces': provinces})

# API lấy dữ liệu thời tiết
def get_weather_data(request):
    year = request.GET.get('year')
    province = request.GET.get('province')
    month = request.GET.get('month')
    
    # Kiểm tra giá trị đầu vào
    if not year or not province or not month:
        return JsonResponse({'error': 'Thiếu thông tin: year, province hoặc month'}, status=400)

    try:
        year = int(year)
        month = int(month)
    except ValueError:
        return JsonResponse({'error': 'Year và month phải là số nguyên'}, status=400)

    # Lọc dữ liệu
    thoitiet['date'] = pd.to_datetime(thoitiet['date'])
    thoitiet_filtered = thoitiet[
        (thoitiet['province'] == province) &
        (thoitiet['date'].dt.year == year) &
        (thoitiet['date'].dt.month == month)
    ]

    if thoitiet_filtered.empty:
        return JsonResponse({'error': 'Không tìm thấy dữ liệu'}, status=404)

    # Trả về dữ liệu
    result = thoitiet_filtered[['date', 'max', 'min', 'humidi', 'wind', 'rain']].to_dict(orient='records')
    return JsonResponse({'table_data': result}, safe=False)


###########thoitiet['date'] = pd.to_datetime(thoitiet['date'])

# View for the weather chart page
def weather_chart(request):
    provinces = get_provinces()
    return render(request, 'weather_chart.html',{'provinces': provinces})

# API to fetch chart data for the frontend
def get_chart_data(request):
    province = request.GET.get('province')
    year = request.GET.get('year')

    if not province or not year:
        return JsonResponse({'error': 'Vui lòng chọn tỉnh và năm!'})

    try:
        year = int(year)
    except ValueError:
        return JsonResponse({'error': 'Năm phải là số nguyên'}, status=400)

    thoitiet_filtered = thoitiet[
        (thoitiet['province'] == province) & (thoitiet['date'].dt.year == year)
    ]

    if thoitiet_filtered.empty:
        return JsonResponse({'error': 'Không có dữ liệu cho năm này'}, status=404)

    # Prepare chart data
    labels = thoitiet_filtered['date'].dt.strftime('%d/%m/%Y').tolist()
    maxTemps = thoitiet_filtered['max'].tolist()
    minTemps = thoitiet_filtered['min'].tolist()
    humidity = thoitiet_filtered['humidi'].tolist()

    return JsonResponse({
        'labels': labels,
        'maxTemps': maxTemps,
        'minTemps': minTemps,
        'humidity': humidity,
    })