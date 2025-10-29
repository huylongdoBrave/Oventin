// c:\Oventin\Lab\ratetable.js

window.OventinRateManager = (function() {
    let prizes = []; // Tham chiếu đến mảng prizes từ main.js

    function initialize() { // Hàm này chỉ chạy 1 lần để gắn sự kiện cho các nút.
        const showProbabilitiesBtn = document.getElementById('show-probabilities-btn');
        const probabilitiesPopupOverlay = document.getElementById('probabilities-popup-overlay');
        const probabilitiesTableBody = document.getElementById('probabilities-table-body');
    
        const probabilitiesCloseBtn = document.getElementById('probabilities-close-btn');
        const totalProbElement = document.getElementById('probabilities-total');
        const applyProbabilitiesBtn = document.getElementById('apply-probabilities-btn');

        if (!showProbabilitiesBtn || !probabilitiesPopupOverlay) {
            console.warn("RateManager: UI elements for rate table not found.");
            return;
        }

        // --- UI LOGIC ---
        function showProbabilitiesPopup() {
            probabilitiesTableBody.innerHTML = ''; // Clear old table

            prizes.forEach((prize, index) => {
                const currentProb = prize.probability * 100; // Convert from 0.35 -> 35
                        
                const row = document.createElement('div');
                row.className = 'probabilities-table-row';

                row.innerHTML = `
                    <div class="prize-name-cell">${prize.name}</div>
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

        // --- DATA UPDATE LOGIC ---
        function applyAllProbabilities() {
            const inputs = probabilitiesTableBody.querySelectorAll('.prize-prob-input');
            let newTotalProbability = 0;
            const newProbabilities = [];
            
            inputs.forEach(input => {
                // const index = parseInt(input.getAttribute('data-index'));
                let newValue = parseFloat(input.value);

                // Validation
                if (isNaN(newValue) || newValue < 0) newValue = 0;
                if (newValue > 100) newValue = 100;

                // // Cập nhật mảng prizes
                // prizes[index].probability = newValue / 100;
                newTotalProbability = newTotalProbability + newValue;
                newProbabilities.push(newValue / 100); // Lưu giá trị đã chuyển đổi (0-1)
            
            });

            // Kiểm tra tổng tỉ lệ trước khi lưu, sai số nhỏ (0.01) để tránh lỗi làm tròn số thập phân
            if (Math.abs(newTotalProbability - 100) > 0.01) {
                alert(`Tổng tỉ lệ phải bằng 100%. Tổng hiện tại của bạn là ${newTotalProbability.toFixed(2)}%. Vui lòng điều chỉnh lại.`);
                return; 
            }

            // Nếu tổng đã hợp lệ, tiến hành cập nhật vào mảng prizes chính
            newProbabilities.forEach((prob, index) => {
                prizes[index].probability = prob;
            }); 

            console.log('All probabilities updated.');
            alert('Đã cập nhật thành công tất cả tỉ lệ!');
            closeProbabilitiesPopup();
        }

        // Total Probab
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
        applyProbabilitiesBtn.addEventListener('click', applyAllProbabilities);
                
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