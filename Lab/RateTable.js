// c:\Oventin\Lab\ratetable.js

window.OventinRateManager = (function() {
    let prizes = []; // Will store the full prize objects { name, probability, ... }

    function initialize(initialPrizes) {
        if (!initialPrizes || initialPrizes.length === 0) {
            console.error("RateManager: Initialization failed. No initial prizes provided.");
            return;
        }
        prizes = initialPrizes;

        // DOM elements
        const showProbabilitiesBtn = document.getElementById('show-probabilities-btn');
        const probabilitiesPopupOverlay = document.getElementById('probabilities-popup-overlay');
        const probabilitiesTableBody = document.getElementById('probabilities-table-body');
        const probabilitiesCloseBtn = document.getElementById('probabilities-close-btn');
        const totalProbElement = document.getElementById('probabilities-total');

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
        function handleProbabilityChange(event) {
            if (event.key === 'Enter') {
                const input = event.target;
                const index = parseInt(input.getAttribute('data-index'));
                let newValue = parseFloat(input.value);

                // Validation
                if (isNaN(newValue) || newValue < 0) newValue = 0;
                if (newValue > 100) newValue = 100;

                // Update the probability in our local 'prizes' array
                prizes[index].probability = newValue / 100;
                
                // Update the input value and the total display
                input.value = newValue.toPrecision(4);
                updateTotalProbability();
                console.log(`Updated prize "${prizes[index].name}" probability to ${newValue}%`);
            }
        }

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
        probabilitiesTableBody.addEventListener('keydown', handleProbabilityChange);
    }

    // Public interface for the module
    return {
        initialize: initialize,
        getProbabilities: function() {
            // Return just the array of probability numbers, which is what the spin logic needs
            return prizes.map(p => p.probability);
        }
    };
})();


        // // --- DRAG Kéo thả bản cũ---
        // let draggedItem = null;

        // probabilitiesTableBody.addEventListener('dragstart', (e) => {
        //     draggedItem = e.target.closest('.probabilities-table-row');
        //     if (!draggedItem) return;
        //     // Add a class to give visual feedback
        //     setTimeout(() => {
        //         draggedItem.classList.add('dragging');
        //     }, 0);
        // });

        // probabilitiesTableBody.addEventListener('dragend', () => {
        //     if (draggedItem) {
        //         draggedItem.classList.remove('dragging');
        //         draggedItem = null;
        //     }
        // });

        // probabilitiesTableBody.addEventListener('dragover', (e) => {
        //     e.preventDefault();
        //     const afterElement = getDragAfterElement(probabilitiesTableBody, e.clientY);
        //     const currentElement = document.querySelector('.dragging');
        //     if (currentElement) {
        //         if (afterElement == null) {
        //             probabilitiesTableBody.appendChild(currentElement);
        //         } else {
        //             probabilitiesTableBody.insertBefore(currentElement, afterElement);
        //         }
        //     }
        // });

        // probabilitiesTableBody.addEventListener('drop', () => {
        //     // Lấy thứ tự ID mới từ DOM
        //     const newOrderIds = Array.from(probabilitiesTableBody.querySelectorAll('.probabilities-table-row'))
        //                              .map(row => parseInt(row.getAttribute('data-prize-id')));
            
        //     // Sắp xếp lại mảng tempPrizes dựa trên thứ tự mới
        //     tempPrizes.sort((a, b) => newOrderIds.indexOf(a.id) - newOrderIds.indexOf(b.id));
        // });

        // function getDragAfterElement(container, y) {
        //     const draggableElements = [...container.querySelectorAll('.probabilities-table-row:not(.dragging)')];

        //     return draggableElements.reduce((closest, child) => {
        //         const box = child.getBoundingClientRect();
        //         const offset = y - box.top - box.height / 2;
        //         if (offset < 0 && offset > closest.offset) {
        //             return { offset: offset, element: child };
        //         } else {
        //             return closest;
        //         }
        //     }, { offset: Number.NEGATIVE_INFINITY }).element;
        // }


        

        // function handleProbabilityChange(event) {
        //     if (event.key === 'Enter') {
        //         const input = event.target;
        //         const index = parseInt(input.getAttribute('data-index'));
        //         let newValue = parseFloat(input.value);

        //         // Validation
        //         if (isNaN(newValue) || newValue < 0) newValue = 0;
        //         if (newValue > 100) newValue = 100;

        //         // Update the probability in our local 'prizes' array
        //         prizes[index].probability = newValue / 100;
                
        //         // Update the input value and the total display
        //         input.value = newValue.toPrecision(4);
        //         updateTotalProbability();
        //         console.log(`Updated prize "${prizes[index].name}" probability to ${newValue}%`);
        //     }
        // }

// probabilitiesTableBody.addEventListener('keydown', handleProbabilityChange);


    // // Mock function to simulate fetching data from a backend
    // function getMockPrizes() {
    //     return new Promise(resolve => {
    //         const mockData = [
    //             {   id: 1,
    //                 name: "Điện thoại",
    //                 type: "image",
    //                 value: "https://s3dev.estuary.solutions/ovaltine2024dev/bda0db2f-f354-4a90-91c8-36ce183c4f38", 
    //                 probability: 0.0005, 
    //                 color: "#ef0012" 
    //             },
    //             { id: 2, name: "Chúc bạn may mắn lần sau", type: "text", value: "Chúc bạn may mắn lần sau", probability: 0.1498, color: "white" },
    //             { id: 3, name: "Máy ảnh", type: "image", value: "https://s3dev.estuary.solutions/ovaltine2024dev/3f8f5ad0-dcc1-4431-b3e7-271d3c990abd", probability: 0.0005, color: "#ef0012" },
    //             { id: 4, name: "Thẻ cào", type: "image", value: "https://s3dev.estuary.solutions/ovaltine2024dev/64ac9af8-24f1-4dc2-86f6-1923cef7e066", probability: 0.35, color: "white" },
    //             { id: 5, name: "Điện thoại", type: "image", value: "https://s3dev.estuary.solutions/ovaltine2024dev/bda0db2f-f354-4a90-91c8-36ce183c4f38", probability: 0.0005, color: "#ef0012" },
    //             { id: 6, name: "Chúc bạn may mắn lần sau", type: "text", value: "Chúc bạn may mắn lần sau", probability: 0.1498, color: "white" },
    //             { id: 7, name: "Máy ảnh", type: "image", value: "https://s3dev.estuary.solutions/ovaltine2024dev/3f8f5ad0-dcc1-4431-b3e7-271d3c990abd", probability: 0.0005, color: "#ef0012" },
    //             { id: 8, name: "Thẻ cào", type: "image", value: "https://s3dev.estuary.solutions/ovaltine2024dev/64ac9af8-24f1-4dc2-86f6-1923cef7e066", probability: 0.35, color: "white" }
    //         ];
    //         resolve(mockData);
    //     });
    // }


