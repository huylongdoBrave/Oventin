// c:\Oventin\VongQuayOventin\addprize.js

window.OventinPrizeAdder = (function() {
    let prizes = []; // Tham chiếu đến mảng prizes từ main.js
    let reinitializeWheelCallback = () => {}; // Callback để gọi lại hàm initializeWheel

    // DOM elements
    const addPrizeBtn = document.getElementById('add-prize-btn');
    const popupOverlay = document.getElementById('add-prize-popup-overlay');
    const closeBtn = document.getElementById('add-prize-close-btn');
    const form = document.getElementById('add-prize-form');

    function initialize(prizesArray, reinitializeCallback) {
        prizes = prizesArray;
        reinitializeWheelCallback = reinitializeCallback;
        // Gắn sự kiện
        addPrizeBtn.addEventListener('click', showPopup);
        closeBtn.addEventListener('click', closePopup);
        form.addEventListener('submit', handleFormSubmit);
    }

    function showPopup() {
        popupOverlay.classList.remove('popup-hidden'); // Hiện popup
        document.body.classList.add('body-no-scroll'); // Chặn cuộn
    }

    function closePopup() {
        popupOverlay.classList.add('popup-hidden'); // Ẩn popup
        document.body.classList.remove('body-no-scroll'); // Cho phép cuộn lại
        form.reset(); // Xóa dữ liệu đã nhập trong form
    }

    function detectPrizeType(value) {
        // Biểu thức kiểm tra chuỗi có kết thúc bằng đuôi file ảnh?
        // (?i) để không phân biệt hoa thường.
        const imageRegex = /\.(jpeg|jpg|gif|png|svg|webp)$/i;
        return imageRegex.test(value) ? 'image' : 'text';
    }

    function handleFormSubmit(event) {
        event.preventDefault(); // Ngăn form gửi đi và tải lại trang

        const formData = new FormData(form);
        const name = formData.get('name').trim();
        const value = formData.get('value').trim();
        const type = detectPrizeType(value); // Tự động nhận diện loại quà
        const color = formData.get('color');
        let probability = parseFloat(formData.get('probability'));

        if (!name || !value) {
            alert('Vui lòng điền đầy đủ thông tin quà!');
            return;
        }
                                    
        // Xác thực giá trị tỉ lệ / Tạo ID tự động tăng
        if (isNaN(probability) || probability < 0) {
            probability = 0;
        }

        // Tính tổng tỉ lệ hiện tại (chuyển từ 0-1 sang 0-100)
        const currentTotalProbability = prizes.reduce((sum, prize) => sum + (prize.probability * 100), 0);
        const newTotalProbability = currentTotalProbability + probability;
        // Kiểm tra nếu tổng mới vượt quá 100% (sử dụng sai số nhỏ để tránh lỗi làm tròn)
        if (newTotalProbability > 100.01) {
            alert(`Không thể thêm. Tổng tỉ lệ hiện tại là ${newTotalProbability.toFixed(2)}% đã vượt mức 100%. Vui lòng điều chỉnh lại.`);
            return; // Dừng hàm, không cho thêm quà
        }

        const newId = prizes.length > 0 ? Math.max(...prizes.map(p => p.id)) + 1 : 1;

        // Tạo đối tượng quà mới
        const newPrize = {
            id: newId,
            name: name,
            type: type,
            value: value,
            probability: probability / 100, // Chuyển từ % (0-100) sang dạng thập phân (0-1)
            color: color
        };

        // Thêm quà mới vào mảng
        prizes.push(newPrize);
        // Lưu lại mảng prizes đã được cập nhật vào Local Storage
        localStorage.setItem('oventinPrizes', JSON.stringify(prizes));

        console.log('Added new prize:', newPrize);
        alert(`Đã thêm quà "${name}" vào vòng quay!`);
        closePopup();

        // Yêu cầu main.js vẽ lại vòng quay
        if (typeof reinitializeWheelCallback === 'function') {
            reinitializeWheelCallback();
        }
    }

    // Public interface
    return {
        initialize: initialize
    };

})();
