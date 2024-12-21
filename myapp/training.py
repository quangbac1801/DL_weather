import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, LSTM, Dropout
from sklearn.model_selection import train_test_split

import os
base_dir = os.path.dirname(os.path.abspath(__file__)) 
media_dir = os.path.join(base_dir, 'media')
dudoan_dir = os.path.join(media_dir, 'dudoan') 

def duDoanThoiTiet(year):

    data = pd.read_csv(os.path.join(media_dir, 'dulieududoan.csv'))

    data['date'] = pd.to_datetime(data['date'])

    thoiTiet = ['max', 'min', 'wind', 'rain', 'humidi', 'cloud']

    scaler_X = MinMaxScaler()
    scaler_Y = MinMaxScaler()

    all_forecasts = [] 

    for province in data['province'].unique():
        print('Dự đoán thành phố:', province)
        province_data = data[data['province'] == province]
        X = province_data[thoiTiet].values
        Y = province_data[['max', 'min', 'wind', 'rain', 'humidi', 'cloud']].values  

        X_scaled = scaler_X.fit_transform(X)
        Y_scaled = scaler_Y.fit_transform(Y)

        def chuoiThoiGian(data, labels, time_steps):
            X_seq, Y_seq = [], []
            for i in range(len(data) - time_steps):
                X_seq.append(data[i: i + time_steps])
                Y_seq.append(labels[i + time_steps])
            return np.array(X_seq), np.array(Y_seq)

        time_steps = 10
        X_seq, Y_seq = chuoiThoiGian(X_scaled, Y_scaled, time_steps)
        X_train, X_test, Y_train, Y_test = train_test_split(X_seq, Y_seq, test_size=0.2, shuffle=False)

        model = Sequential()
        model.add(LSTM(100, return_sequences=True, input_shape=(time_steps, len(thoiTiet))))
        model.add(Dropout(0.2))
        model.add(LSTM(100))
        model.add(Dense(6))  

        model.compile(optimizer='adam', loss='mean_squared_error')
        model.fit(X_train, Y_train, epochs=50, batch_size=32)

        nam = pd.date_range(start=f'{year}-01-01', end=f'{year}-12-31', freq='D')
        for date in nam:
            getNgayThang = province_data[(province_data['date'].dt.day == date.day) & 
                                          (province_data['date'].dt.month == date.month)]
            if len(getNgayThang) > 0:
                dt = getNgayThang[thoiTiet].values
                dt_scaled = scaler_X.transform(dt)
                if len(dt_scaled) >= time_steps:
                    dt_seq = np.array([dt_scaled[-time_steps:]])
                    dudoan_dt = model.predict(dt_seq)
                    dudoan = scaler_Y.inverse_transform(dudoan_dt)
                    all_forecasts.append((province, dudoan[0][0], dudoan[0][1], dudoan[0][2], dudoan[0][3], dudoan[0][4], dudoan[0][5], date))

    dudoan_df_year = pd.DataFrame(all_forecasts, columns=['province', 'max', 'min', 'wind', 'rain', 'humidi', 'cloud', 'date'])
    dudoan_df_year.to_csv(os.path.join(dudoan_dir, f'dudoannam_{year}.csv'), index=None)

    print(f"Dự đoán cho tất cả các tỉnh trong năm {year} đã được lưu vào file 'dudoannam_{year}.csv'.")

duDoanThoiTiet(2025)
dubao = pd.read_csv(os.path.join(dudoan_dir, 'dudoannam_2025.csv'))
goc = pd.read_csv(os.path.join(media_dir, 'dulieududoan.csv'))

contact = pd.concat([goc,dubao])

contact.to_csv(os.path.join(media_dir,'dulieududoan.csv'), index =None)
