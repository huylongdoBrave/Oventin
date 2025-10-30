// c:\Oventin\Lab\ratetable.js

window.OventinRateManager = (function() {
    let prizes = []; // Tham chiếu đến mảng prizes từ main.js
    let reinitializeWheelCallback = () => {}; // Callback để gọi lại hàm drawWheel từ main.js
    let normalizeProbabilitiesCallback = () => {};

    function initialize(callback, normalizeCallback) { // Hàm này chỉ chạy 1 lần để gắn sự kiện cho các nút.
        const showProbabilitiesBtn = document.getElementById('show-probabilities-btn');
        const probabilitiesPopupOverlay = document.getElementById('probabilities-popup-overlay');
        const probabilitiesTableBody = document.getElementById('probabilities-table-body');
    
        const probabilitiesCloseBtn = document.getElementById('probabilities-close-btn');
        const totalProbElement = document.getElementById('probabilities-total');
        const applyProbabilitiesBtn = document.getElementById('apply-probabilities-btn');

        if (typeof callback === 'function') {
            reinitializeWheelCallback = callback;
        }
        if (typeof normalizeCallback === 'function') {
            normalizeProbabilitiesCallback = normalizeCallback;
        }

        if (!showProbabilitiesBtn || !probabilitiesPopupOverlay) {
            console.warn("RateManager: UI elements for rate table not found.");
            return;
        }

        // --- Tạo cột quà mới ---
        function showProbabilitiesPopup() {
            probabilitiesTableBody.innerHTML = ''; // Clear old table
            prizes.forEach((prize, index) => {
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
        }

        // --- Cập nhật cột quà ---
        function applyAllProbabilities() {
            const inputs = probabilitiesTableBody.querySelectorAll('.prize-prob-input');
            let newTotalProbability = 0;
            const newProbabilities = [];
            
            inputs.forEach(input => {
                const id = parseInt(input.getAttribute('data-id'));
                let newValue = parseFloat(input.value);

                // Validation
                if (isNaN(newValue) || newValue < 0) {newValue = 0;} 
                if (newValue > 100) {newValue = 100;} 

                // // Cập nhật mảng prizes
                // prizes[index].probability = newValue / 100;
                newTotalProbability = newTotalProbability + newValue;
                newProbabilities.push({ id: id, probability: newValue / 100 }); // Lưu giá trị đã chuyển đổi (0-1)
            });

            // Nếu tổng đã hợp lệ, tiến hành cập nhật vào mảng prizes chính
            newProbabilities.forEach(newProb => {
                const prizeToUpdate = prizes.find(p => p.id === newProb.id);
                if (prizeToUpdate) {prizeToUpdate.probability = newProb.probability;}
            });

            console.log('All probabilities updated.');
            // Tự động cân bằng lại tất cả tỉ lệ sau khi người dùng áp dụng
            if (typeof normalizeProbabilitiesCallback === 'function') {
                normalizeProbabilitiesCallback(prizes);
            }

            alert('Đã cập nhật vòng xoay');
            closeProbabilitiesPopup();
        }

        // Tổng tỉ lệ
        function updateTotalProbability() {
            const total = prizes.reduce((sum, prize) => sum + prize.probability, 0) * 100;
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
        probabilitiesTableBody.addEventListener('change', (event) => {
            const target = event.target;
            if (target.classList.contains('prize-color-input')) {
                const prizeId = parseInt(target.getAttribute('data-id'));
                const prizeToUpdate = prizes.find(p => p.id === prizeId);
                if(prizeToUpdate){
                    prizeToUpdate.color = target.value;
                    reinitializeWheelCallback;
                }
            }
        });
        probabilitiesTableBody.addEventListener('click', (event) => {
            const target = event.target;
            if (target.classList.contains('delete-prize-btn')) {
                const prizeId = parseInt(target.getAttribute('data-id'));
                const prizeToDelete = prizes.find(p => p.id === prizeId);
                if (!prizeToDelete) return;
                if (confirm(`Bạn có chắc chắn muốn xóa quà "${prizeToDelete.name}" không?`)) {
                    const prizeIndex = prizes.findIndex(p => p.id === prizeId);
                    if (prizeIndex > -1) {
                        prizes.splice(prizeIndex, 1);
                    }
                    // Tự động cân bằng lại tỉ lệ sau khi xóa
                    if (typeof normalizeProbabilitiesCallback === 'function') {
                        normalizeProbabilitiesCallback(prizes);
                    }

                    showProbabilitiesPopup(); // Cập nhật lại bảng
                    reinitializeWheelCallback(); // Vẽ lại vòng quay
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