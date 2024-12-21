document.getElementById("chartForm").addEventListener("submit", function(event) {
    event.preventDefault();

    // Lấy thông tin người dùng nhập
    var province = document.getElementById("provinceInput").value;
    var year = document.getElementById("yearInput").value;

    // Kiểm tra dữ liệu nhập
    if (!province || !year) {
        alert("Vui lòng chọn tỉnh và nhập năm.");
        return;
    }

    // Fetch dữ liệu biểu đồ từ backend
    fetch(`/get_chart_data/?province=${province}&year=${year}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                // Xóa các biểu đồ cũ trước khi tạo biểu đồ mới
                clearCharts();

                // Tạo biểu đồ nhiệt độ tối đa
                var maxTempCtx = document.getElementById('maxTempChart').getContext('2d');
                new Chart(maxTempCtx, {
                    type: 'line',
                    data: {
                        labels: data.labels, // Nhãn trục X (ngày tháng)
                        datasets: [{
                            label: 'Max Temperature',
                            data: data.maxTemps,
                            borderColor: 'red',
                            fill: false,
                            tension: 0.1
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'Date'
                                }
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: 'Temperature (°C)'
                                }
                            }
                        }
                    }
                });

                // Tạo biểu đồ nhiệt độ tối thiểu
                var minTempCtx = document.getElementById('minTempChart').getContext('2d');
                new Chart(minTempCtx, {
                    type: 'line',
                    data: {
                        labels: data.labels, // Nhãn trục X (ngày tháng)
                        datasets: [{
                            label: 'Min Temperature',
                            data: data.minTemps,
                            borderColor: 'blue',
                            fill: false,
                            tension: 0.1
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'Date'
                                }
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: 'Temperature (°C)'
                                }
                            }
                        }
                    }
                });

                // Tạo biểu đồ độ ẩm
                var humidityCtx = document.getElementById('humidityChart').getContext('2d');
                new Chart(humidityCtx, {
                    type: 'line',
                    data: {
                        labels: data.labels, // Nhãn trục X (ngày tháng)
                        datasets: [{
                            label: 'Humidity',
                            data: data.humidity,
                            borderColor: 'green',
                            fill: false,
                            tension: 0.1
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'Date'
                                }
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: 'Humidity (%)'
                                }
                            }
                        }
                    }
                });
            }
        })
        .catch(error => {
            alert('Có lỗi khi tải dữ liệu');
            console.error('Error fetching data:', error);
        });
});

// Hàm để xóa các biểu đồ cũ trước khi tạo biểu đồ mới
function clearCharts() {
    // Xóa biểu đồ nếu có
    var chartElements = document.querySelectorAll('canvas');
    chartElements.forEach(element => {
        var chartInstance = Chart.getChart(element); // Tìm thể hiện biểu đồ
        if (chartInstance) {
            chartInstance.destroy(); // Hủy biểu đồ hiện tại
        }
    });
}