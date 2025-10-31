// c:\Oventin\Lab\ratetable.js

window.OventinRateManager = (function() {
    let prizes = []; // Tham chiếu đến mảng prizes từ main.js
    let tempPrizes = []; // Bản sao tạm thời của prizes để chỉnh sửa trong popup
    let reinitializeWheelCallback = () => {}; // Callback để gọi lại hàm drawWheel từ main.js

    function initialize(callback) { // Hàm này chỉ chạy 1 lần để gắn sự kiện cho các nút.
        const showProbabilitiesBtn = document.getElementById('show-probabilities-btn');
        const probabilitiesPopupOverlay = document.getElementById('probabilities-popup-overlay');
        const probabilitiesTableBody = document.getElementById('probabilities-table-body');
    
        const probabilitiesCloseBtn = document.getElementById('probabilities-close-btn');
        const totalProbElement = document.getElementById('probabilities-total');
        const applyProbabilitiesBtn = document.getElementById('apply-probabilities-btn');

        if (typeof callback === 'function') {
            reinitializeWheelCallback = callback;
        }

        if (!showProbabilitiesBtn || !probabilitiesPopupOverlay) {
            console.warn("RateManager: UI elements for rate table not found.");
            return;
        }


        // --- Tạo cột quà mới ---
        function showProbabilitiesPopup() {
            // Tạo một bản sao sâu (deep copy) của mảng prizes để chỉnh sửa an toàn
            tempPrizes = JSON.parse(JSON.stringify(prizes));

            probabilitiesTableBody.innerHTML = ''; // Clear old table
            tempPrizes.forEach((prize, index) => {
                const currentProb = prize.probability * 100; // Convert from 0.35 -> 35

                const row = document.createElement('div');
                row.className = 'probabilities-table-row';
                row.innerHTML = `
                    <div class="prize-name-cell">${prize.name}</div>
                    <div class="prize-color-cell">
                        <input type="color" class="prize-color-input" value="${prize.color}" data-id="${prize.id}">
                    </div>
                    <div class="prize-prob-cell">
                        <input type="number" class="prize-prob-input" value="${currentProb.toPrecision(4)}" data-id="${prize.id}" min="0" max="100" step="0.01">
                    </div>
                    <div style="margin-left: 10px;" class="prize-delete-cell">
                        <button class="delete-prize-btn" data-id="${prize.id}" title="Xóa">&times;</button>
                    </div>
                `;
                probabilitiesTableBody.appendChild(row);
            });
            updateTotalProbability();
            probabilitiesPopupOverlay.classList.remove('popup-hidden');
        }
        function closeProbabilitiesPopup() {
            probabilitiesPopupOverlay.classList.add('popup-hidden');
            // Vì người dùng đã đóng popup mà không lưu,
            // chúng ta cần vẽ lại vòng quay với dữ liệu gốc để hủy mọi thay đổi về màu sắc đã xem trước.
            reinitializeWheelCallback();
        }


        // --- Cập nhật cột quà ---
        function applyAllProbabilities() {
            const inputs = probabilitiesTableBody.querySelectorAll('.prize-prob-input');
            let newTotalProbability = 0;
            
            inputs.forEach(input => {
                const id = parseInt(input.getAttribute('data-id'));
                let newValue = parseFloat(input.value);

                // Validation
                if (isNaN(newValue) || newValue < 0) { newValue = 0; }

                // Cập nhật giá trị mới vào mảng tempPrizes
                const prizeToUpdate = tempPrizes.find(p => p.id === id);
                if (prizeToUpdate) { prizeToUpdate.probability = newValue / 100; }

                newTotalProbability = newTotalProbability + newValue;
            });

            if (newTotalProbability > 100.01) {
                alert(`Cảnh báo tỉ lệ đang: ${newTotalProbability.toFixed(2)}%. Vui lòng chỉnh tổng  dưới 100%`);
            }

            // Cập nhật dữ liệu từ bản sao tạm thời (tempPrizes) vào mảng gốc (prizes)
            // prizes = tempPrizes không hoạt động vì nó chỉ thay đổi tham chiếu cục bộ.
            // Chúng ta cần xóa mảng gốc và đẩy dữ liệu mới vào.
            prizes.length = 0; // Xóa sạch mảng gốc
            Array.prototype.push.apply(prizes, tempPrizes); // Đẩy tất cả phần tử từ tempPrizes vào

            console.log('All probabilities updated.');
            alert('Đã cập nhật vòng xoay');
            closeProbabilitiesPopup();
        }


        // Tổng tỉ lệ
        function updateTotalProbability() {
            const total = tempPrizes.reduce((sum, prize) => sum + prize.probability, 0) * 100;
            totalProbElement.textContent = `Tổng tỉ lệ: ${total.toFixed(2)}%`;
            if (Math.abs(total - 100) > 0.01) {
                totalProbElement.style.color = '#ffeb3b'; // Warning yellow
            } else {
                totalProbElement.style.color = 'white';
            }
        }
        
        // Cập nhật tổng tỉ lệ dựa trên các giá trị đang được nhập trong input
        function updateTotalFromInputs() {
            const inputs = probabilitiesTableBody.querySelectorAll('.prize-prob-input');
            let total = 0;
            inputs.forEach(input => {
                total += parseFloat(input.value) || 0;
            });

            totalProbElement.textContent = `Tổng tỉ lệ: ${total.toFixed(2)}%`;
            if (Math.abs(total - 100) > 0.01) {
                totalProbElement.style.color = '#ffeb3b'; // Warning yellow
            } else {
                totalProbElement.style.color = 'white';
            }
        }


        // --- EVENT LISTENERS ---
        showProbabilitiesBtn.addEventListener('click', showProbabilitiesPopup);
        probabilitiesCloseBtn.addEventListener('click', closeProbabilitiesPopup);
        applyProbabilitiesBtn.addEventListener('click', () => {
            applyAllProbabilities();
            if (typeof reinitializeWheelCallback === 'function') {
                reinitializeWheelCallback(); // Vẽ lại vòng quay sau khi tỉ lệ được áp dụng
            }
        }); 
        // Sự kiện 'change' cho color input (chỉ kích hoạt khi người dùng chọn xong màu)
        probabilitiesTableBody.addEventListener('change', (event) => {
            const target = event.target;
            if (target.classList.contains('prize-color-input')) {
                const prizeId = parseInt(target.getAttribute('data-id'));
                const prizeToUpdate = tempPrizes.find(p => p.id === prizeId);
                if (prizeToUpdate) {
                    prizeToUpdate.color = target.value;
                    // Không vẽ lại vòng quay ở đây để tránh áp dụng thay đổi vào dữ liệu gốc
                }
            }
        });
        // Sự kiện 'input' cho probability (kích hoạt mỗi khi người dùng gõ)
        probabilitiesTableBody.addEventListener('input', (event) => {
            if (event.target.classList.contains('prize-prob-input')) updateTotalFromInputs();
        });
        // Sự kiện xóa quà
        probabilitiesTableBody.addEventListener('click', (event) => {
            const target = event.target;
            if (target.classList.contains('delete-prize-btn')) {
                const prizeId = parseInt(target.getAttribute('data-id'));
                const prizeToDelete = tempPrizes.find(p => p.id === prizeId);
                if (!prizeToDelete) return;
                if (confirm(`Bạn có chắc chắn muốn xóa quà "${prizeToDelete.name}" không?`)) {
                    const prizeIndex = tempPrizes.findIndex(p => p.id === prizeId);
                    if (prizeIndex > -1) {
                        tempPrizes.splice(prizeIndex, 1);
                    }
                    // showProbabilitiesPopup(); // Cập nhật lại bảng
                    // Xóa hàng trực tiếp khỏi DOM và cập nhật lại tổng
                    target.closest('.probabilities-table-row').remove();
                    updateTotalFromInputs();
                }  
            }
        });


    }          

    // Public interface for the module
    return {
        initialize: initialize, // Gắn sự kiện
        updateData: function(newPrizes) {
            // Cập nhật dữ liệu quà khi có thay đổi
            if (newPrizes) {
                prizes = newPrizes;
            }
        },
        getProbabilities: function() {
            // Trả về mảng các con số tỉ lệ
            return prizes.map(p => p.probability);
        }
    };
    

})();