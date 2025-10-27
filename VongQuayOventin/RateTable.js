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