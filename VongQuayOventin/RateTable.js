// RateTable.js

// Tạo một "namespace" để tránh xung đột biến toàn cục
window.OventinRateManager = (function() {

    // Dữ liệu tỉ lệ mặc định, có thể được truy cập và thay đổi
    let prizeProbabilities = [
        0.0005, // 0: ID 1
        0.1495, // 1: ID 2
        0.0005, // 2: ID 3
        0.35,   // 3: ID 4
        0.0005, // 4: ID 5
        0.1495, // 5: ID 6
        0.0005, // 6: ID 7
        0.35,   // 7: ID 8
    ];

    function initialize() {
        // Lấy các phần tử DOM cần thiết
        const showProbabilitiesBtn = document.getElementById('show-probabilities-btn');
        const probabilitiesPopupOverlay = document.getElementById('probabilities-popup-overlay');
        const probabilitiesTableBody = document.getElementById('probabilities-table-body');
        const probabilitiesCloseBtn = document.getElementById('probabilities-close-btn');
        const totalProbElement = document.getElementById('probabilities-total');

        if (!showProbabilitiesBtn) return; // Thoát nếu không có nút "Tỉ lệ"

        // --- LOGIC HIỂN THỊ POPUP ---
        function showProbabilitiesPopup() {
            probabilitiesTableBody.innerHTML = ''; // Xóa bảng cũ
            const slices = document.querySelectorAll(".container-wheel-part");

            slices.forEach((slice, index) => {
                const prizeName = slice.getAttribute('data-name');
                const currentProb = prizeProbabilities[index] * 100; // Chuyển từ 0.35 -> 35

                const row = document.createElement('div');
                row.className = 'probabilities-table-row';

                row.innerHTML = `
                    <div class="prize-name-cell">${prizeName}</div>
                    <div class="prize-prob-cell">
                        <input type="number" class="prize-prob-input" value="${currentProb.toPrecision(4)}" data-index="${index}" min="0" max="100" step="0.01">
                        <span>%</span>
                    </div>
                `;
                probabilitiesTableBody.appendChild(row);
            });

            updateTotalProbability();
            probabilitiesPopupOverlay.classList.remove('popup-hidden');
        }

        function closeProbabilitiesPopup() {
            probabilitiesPopupOverlay.classList.add('popup-hidden');
        }

        // --- LOGIC CẬP NHẬT TỈ LỆ ---
        function handleProbabilityChange(event) {
            if (event.key === 'Enter') {
                const input = event.target;
                const index = parseInt(input.getAttribute('data-index'));
                let newValue = parseFloat(input.value);

                // Validation
                if (isNaN(newValue) || newValue < 0) newValue = 0;
                if (newValue > 100) newValue = 100;

                // Cập nhật mảng tỉ lệ
                prizeProbabilities[index] = newValue / 100;
                
                // Cập nhật lại giá trị trong input và tổng
                input.value = newValue.toPrecision(4);
                updateTotalProbability();
                console.log(`Updated prize "${document.querySelectorAll(".container-wheel-part")[index].getAttribute('data-name')}" probability to ${newValue}%`);
            }
        }

        function updateTotalProbability() {
            const total = prizeProbabilities.reduce((sum, prob) => sum + prob, 0) * 100;
            totalProbElement.textContent = `Tổng tỉ lệ: ${total.toFixed(2)}%`;
            if (Math.abs(total - 100) > 0.01) {
                totalProbElement.style.color = '#ffeb3b'; // Màu vàng cảnh báo
            } else {
                totalProbElement.style.color = 'white';
            }
        }

        // --- GẮN SỰ KIỆN ---
        showProbabilitiesBtn.addEventListener('click', showProbabilitiesPopup);
        probabilitiesCloseBtn.addEventListener('click', closeProbabilitiesPopup);
        probabilitiesTableBody.addEventListener('keydown', handleProbabilityChange);
    }

    // Trả về các thành phần public để file khác có thể sử dụng
    return {
        initialize: initialize,
        getProbabilities: function() {
            return prizeProbabilities;
        }
    };
})();

// Khởi chạy module khi DOM đã sẵn sàng
document.addEventListener('DOMContentLoaded', OventinRateManager.initialize);