//Thời tiết hàng tháng
const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

async function fetchWeatherData() {
    const province = document.getElementById('province').value;
    const year = document.getElementById('year').value;
    const month = document.getElementById('month').value;

    try {
        const response = await fetch(`/get-weather-data/?province=${province}&year=${year}&month=${month}`);
        const data = await response.json();

        const calendarContainer = document.getElementById('weather-calendar');
        calendarContainer.innerHTML = '';

        if (data.error) {
            calendarContainer.innerHTML = `<div class="col-12 text-center text-danger">${data.error}</div>`;
            return;
        }

        // Lấy thông tin về số ngày trong tháng và tạo lịch
        const totalDaysInMonth = new Date(year, month, 0).getDate();
        const firstDayOfMonth = new Date(year, month - 1, 1).getDay();

        // Tạo các ô cho lịch
        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('day');
            calendarContainer.appendChild(emptyCell);
        }

        data.table_data.forEach((row, index) => {
            const dayCell = document.createElement('div');
            dayCell.classList.add('day');

            const day = index + 1; // Ngày bắt đầu từ 1
            const dayOfWeek = (firstDayOfMonth + index) % 7; // Tính thứ trong tuần

            dayCell.innerHTML = `
                  <span>${daysOfWeek[dayOfWeek]} - ${day}/${month}/${year}</span>
                <div class="weather-data">
                    <div class="temp-max">Max: ${row.max}°C</div>
                    <div class="temp-min">Min: ${row.min}°C</div>
                    <div class="humidity">Humidity: ${row.humidi}%</div>
                </div>
            `;

            calendarContainer.appendChild(dayCell);
        });

        // Nếu tháng không đủ 31 ngày, thêm các ô trống vào cuối
        const remainingCells = 35 - totalDaysInMonth - firstDayOfMonth;
        for (let i = 0; i < remainingCells; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('day');
            calendarContainer.appendChild(emptyCell);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}
