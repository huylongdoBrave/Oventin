// c:\Oventin\Lab\ratetable.js

window.OventinRateManager = (function() {
    let prizes = []; //  mảng prizes từ main.js
    let tempPrizes = []; // Bản sao prize 
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

                // Kiểm tra type có phải hình?
                const valueCellContent = prize.type === 'image'
                ? `<img src="${prize.value}" class="prize-value-image" alt="Preview">`: prize.value;

                const row = document.createElement('div');
                // drag
                row.setAttribute('draggable', 'true');
                row.setAttribute('data-prize-id', prize.id);
                row.className = 'probabilities-table-row';
                row.innerHTML = `
                    <div class="prize-id-cell">${prize.id}</div>
                    <div class="prize-name-cell" style="cursor: grab;"><i class="fa-solid fa-grip-vertical" style="margin-right: 8px;"></i>${prize.name}</div>
                    <div class="prize-type-cell" title="${prize.value}">${valueCellContent}</div>
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
            document.body.classList.add('body-no-scroll'); // Chặn cuộn
        }
        function closeProbabilitiesPopup() {
            probabilitiesPopupOverlay.classList.add('popup-hidden');
            // Vì người dùng đã đóng popup mà không lưu,
            document.body.classList.remove('body-no-scroll'); // Cho phép cuộn lại
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
                alert(`Cảnh báo tỉ lệ đang ${newTotalProbability.toFixed(2)}% . Vui lòng chỉnh tổng dưới 100%`);
                return;
            }

            // Chúng ta cần xóa mảng gốc và đẩy dữ liệu mới vào.
            prizes.length = 0; // Xóa sạch mảng gốc
            Array.prototype.push.apply(prizes, tempPrizes); // Đẩy tất cả phần tử từ tempPrizes vào

            // Lưu trạng thái mới vào Local Storage
            localStorage.setItem('oventinPrizes', JSON.stringify(prizes));

            console.log('All probabilities updated.');
            alert('Đã cập nhật thành công!');
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

        // --- DRAG Kéo thả (Sử dụng SortableJS) ---
        new Sortable(probabilitiesTableBody, {
            animation: 150, // Hiệu ứng animation khi kéo
            ghostClass: 'dragging', // Class CSS cho "bóng ma" của item đang kéo
            handle: '.prize-name-cell', // Chỉ cho phép kéo khi nhấn vào vùng tên quà
            onEnd: function (evt) {
                // Sự kiện này được gọi khi người dùng thả item ra
                // Lấy thứ tự ID mới từ DOM sau khi đã sắp xếp
                const newOrderIds = Array.from(evt.to.children)
                .map(row => parseInt(row.getAttribute('data-prize-id')));
                
                // Sắp xếp lại mảng tempPrizes dựa trên thứ tự mới
                tempPrizes.sort((a, b) => newOrderIds.indexOf(a.id) - newOrderIds.indexOf(b.id));
                console.log("Update queue prize.");
            }
        });
        
        // --- EVENT LISTENERS ---
        showProbabilitiesBtn.addEventListener('click', showProbabilitiesPopup);
        probabilitiesCloseBtn.addEventListener('click', closeProbabilitiesPopup);
        applyProbabilitiesBtn.addEventListener('click', () => {
            applyAllProbabilities();
            if (typeof reinitializeWheelCallback === 'function') {
                // reinitializeWheelCallback(); // Không cần gọi lại ở đây vì closeProbabilitiesPopup đã gọi rồi
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