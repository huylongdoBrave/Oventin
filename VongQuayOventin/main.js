document.addEventListener("DOMContentLoaded", () => {
    // Wheel
    const wheel = document.querySelector(".container-wheel");
    const spinBtn = document.getElementById("spin");
    const slices = document.querySelectorAll(".container-wheel-part");

    // popup
    const popupOverlay = document.getElementById("popup-overlay");
    const prizeNameElement = document.getElementById("popup-prize-name");
    // const closeBtn = document.getElementById("popup-close-btn");
    const confirmBtn = document.getElementById("popup-confirm-btn");

    // Tính năng roll
    const sliceCount = slices.length; // Số lượng ô (8)
    const sliceAngle = 360 / sliceCount; // Góc của mỗi ô (45 độ)
    let isSpinning = false;
    let currentRotation = 0;

    // Lượt quay
    const spinCountElement = document.getElementById('spin-count');
    const addSpinsButton = document.getElementById('add-spins-btn');
    let currentSpins = 5;

    // Sự kiện quay
    spinBtn.addEventListener("click", () => {
        // Không cho phép quay khi đang quay
        if (isSpinning) {
            return;
        }

        // Kiểm tra và trừ lượt quay
        if (currentSpins <= 0) {
            alert("Bạn đã hết lượt quay. Vui lòng thêm lượt để tiếp tục!");
            return;
        }
        currentSpins--;
        updateSpinDisplay();

        isSpinning = true;

        // 1. Lấy mảng tỉ lệ mới nhất từ RateTable.js
        const prizeProbabilities = window.OventinRateManager.getProbabilities();

        // Chọn một ô ngẫu nhiên để trúng thưởng THEO TỈ LỆ
        function getWeightedRandomIndex() {
            let rand = Math.random(); // Số ngẫu nhiên từ 0.0 đến 1.0
            for (let i = 0; i < prizeProbabilities.length; i++) {
                if (rand < prizeProbabilities[i]) {
                    return i;
                }
                rand -= prizeProbabilities[i];
            }
            // Fallback trong trường hợp có lỗi làm tròn số
            return prizeProbabilities.length - 1;
        }

        const winningSliceIndex = getWeightedRandomIndex();

        // 2. Tính toán góc quay
        // Thêm số vòng quay ngẫu nhiên (ví dụ: 5 đến 10 vòng) để tạo hiệu ứng
        const randomSpins = Math.floor(Math.random() * 6) + 5;

        // Góc cần đến để dừng lại ở ô trúng thưởng.
        // Mũi tên ở trên cùng (0 độ), quay ngược chiều kim đồng hồ.
        // Góc của ô trúng thưởng = (index * góc mỗi ô).
        const cssOffsetAngle = -22.5; // Góc lệch ban đầu từ CSS
        const targetAngle = winningSliceIndex * sliceAngle + cssOffsetAngle;

        // Tổng góc quay = (số vòng quay * 360) + góc dừng
        // Dấu trừ cho quay ngược chiều kim đồng hồ để khớp với thứ tự ô
        const totalRotation = -(randomSpins * 360 + targetAngle);

        // 3. Thực hiện animation quay
        const spinDuration = 5; // 5 giây
        wheel.style.transition = `transform ${spinDuration}s cubic-bezier(0.25, 0.1, 0.25, 1)`; // ease-out
        wheel.style.transform = `rotate(${totalRotation}deg)`;

        // 4. Hiển thị kết quả 
        setTimeout(() => {
            const winningSlice = slices[winningSliceIndex];
            const prizeName = winningSlice.getAttribute('data-name');
            // Hiển thị popup
            prizeNameElement.textContent = prizeName;
            popupOverlay.classList.remove("popup-hidden");

            // Reset lại vòng quay để lần sau quay như mới
            const finalRotation = totalRotation % 360; // Lấy góc cuối cùng trong khoảng 0-360
            wheel.style.transition = 'none'; // Bỏ hiệu ứng chuyển động
            wheel.style.transform = `rotate(${finalRotation}deg)`; // Đặt lại góc quay
            wheel.offsetHeight; // Trick để trình duyệt áp dụng thay đổi ngay lập tức

            isSpinning = false;
        }, spinDuration * 1000);
    });

    // Lượt quay
        // Cập nhật hiển thị số lượt quay
        function updateSpinDisplay() {
            spinCountElement.textContent = currentSpins;
        }

        // Thêm sự kiện click cho nút "Thêm lượt"
        addSpinsButton.addEventListener('click', function() {
            currentSpins += 10;
            updateSpinDisplay();
        });

    //popup 
        function closePopup() {
        popupOverlay.classList.add("popup-hidden");
        }

        // closeBtn.addEventListener("click", closePopup);
        confirmBtn.addEventListener("click", closePopup);

});