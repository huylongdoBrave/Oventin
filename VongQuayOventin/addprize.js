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
        popupOverlay.classList.remove('popup-hidden');
    }

    function closePopup() {
        popupOverlay.classList.add('popup-hidden');
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

        if (!name || !value) {
            alert('Vui lòng điền đầy đủ thông tin quà!');
            return;
        }

        // Tạo ID tự động tăng
        const newId = prizes.length > 0 ? Math.max(...prizes.map(p => p.id)) + 1 : 1;

        // Tạo đối tượng quà mới
        const newPrize = {
            id: newId,
            name: name,
            type: type,
            value: value,
            probability: 0, // Mặc định tỉ lệ là 0, người dùng sẽ chỉnh sau
            color: color
        };

        // Thêm quà mới vào mảng
        prizes.push(newPrize);

        console.log('Added new prize:', newPrize);
        alert(`Đã thêm quà "${name}" thành công!`);

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
