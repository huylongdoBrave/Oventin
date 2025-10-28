document.addEventListener("DOMContentLoaded", async () => {
    // DOM Elements
    // Vòng xoay
    const wheelContainer = document.querySelector(".container-wheel");
    const spinBtn = document.getElementById("spin");
    const spinCountElement = document.getElementById('spin-count');
    const addSpinsButton = document.getElementById('add-spins-btn');
    
    // Popup trúng quà
    const popupOverlay = document.getElementById("popup-overlay");
    const prizeNameElement = document.getElementById("popup-prize-name");
    const confirmBtn = document.getElementById("popup-confirm-btn");

    // Popup thêm quà
    const addPrizeBtn = document.getElementById('add-prize-btn');
    const addPrizePopupOverlay = document.getElementById('add-prize-popup-overlay');
    const addPrizeCloseBtn = document.getElementById('add-prize-close-btn');

    // Game State
    let prizes = [];
    let slices = [];
    let sliceCount = 0;
    let sliceAngle = 0;
    let cssOffsetAngle = 0;
    let isSpinning = false;
    let currentSpins = 5;

    // --- 1. INITIALIZE THE WHEEL ---
    // async function initializeWheel() {

    // Hàm này chỉ vẽ lại vòng quay dựa trên mảng `prizes` hiện có.
    // Và không fetch lại dữ liệu.
    function drawWheel() {
        try {
                // fetch from an API:
                // const response = await fetch('/api/prizes');
                // prizes = await response.json();
                // For demonstration, we use mock data. The backend would provide this.
            // prizes = await getMockPrizes();

            if (!prizes || prizes.length === 0) {
                console.error("No prizes found.");
                alert("Không có quà để hiển thị. Vui lòng thử lại sau");
                return;
            }

            // Calculate wheel parameters
            sliceCount = prizes.length;
            sliceAngle = 360 / sliceCount;
            cssOffsetAngle = -(sliceAngle / 2); // Offset to center the pointer

            // Clear previous wheel and build probabilities array
            wheelContainer.innerHTML = '';

            // Tính toán chiều rộng động cho mỗi ô quà
            const containerWheelSize = parseFloat(getComputedStyle(wheelContainer).width);
            // Công thức: đường kính * sin(góc ở tâm / 2).
            // Nhân với 1.01 (tăng 1%) để bù vào lỗi làm tròn của trình duyệt, giúp các ô khít vào nhau.
            const dynamicWidth = containerWheelSize * Math.sin((sliceAngle / 2) * (Math.PI / 180)) * 1.05;


            // Generate wheel slices dynamically
            prizes.forEach((prize, index) => {

                const slice = document.createElement('div');
                slice.className = 'container-wheel-part';
                slice.setAttribute('data-id', prize.id);
                slice.setAttribute('data-name', prize.name);

                // Áp dụng chiều rộng động
                slice.style.width = `${dynamicWidth}px`;

                // Create content (image or text)
                if (prize.type === 'image') {
                    const img = document.createElement('img');
                    img.src = prize.value;
                    img.alt = prize.name;
                    img.className = 'image-wheel';
                    slice.appendChild(img);
                } else {
                    const p = document.createElement('p');
                    p.textContent = prize.value;
                    p.className = 'p-wheel';
                    slice.appendChild(p);
                }

                // Apply dynamic styles for rotation and color
                const rotation = cssOffsetAngle + index * sliceAngle;
                slice.style.transform = `translateX(-50%) rotate(${rotation}deg)`;
                slice.style.background = prize.color;

                wheelContainer.appendChild(slice);
            });

            // Update the slices NodeList
            slices = document.querySelectorAll(".container-wheel-part");

            // Tỉ lệ quà, Initialize the Rate Manager with the prize data
            // Chỉ cập nhật dữ liệu cho RateManager, không khởi tạo lại
            window.OventinRateManager.updateData(prizes);
        } catch (error) {
            console.error("Failed to add prize wheel:", error);
        }
    }

    // Hàm này chạy một lần duy nhất để lấy dữ liệu và thiết lập ứng dụng
    async function initApp() {
        // Mock function to simulate fetching data from a backend
        function getMockPrizes() {
            return new Promise(resolve => {
                const mockData = [
                    {   id: 1, name: "Điện thoại", type: "image", value: "https://s3dev.estuary.solutions/ovaltine2024dev/bda0db2f-f354-4a90-91c8-36ce183c4f38", probability: 0.0005, color: "#ef0012" },
                    { id: 2, name: "Chúc bạn may mắn lần sau", type: "text", value: "Chúc bạn may mắn lần sau", probability: 0.1498, color: "white" },
                    { id: 3, name: "Máy ảnh", type: "image", value: "https://s3dev.estuary.solutions/ovaltine2024dev/3f8f5ad0-dcc1-4431-b3e7-271d3c990abd", probability: 0.0005, color: "#ef0012" },
                    { id: 4, name: "Thẻ cào", type: "image", value: "https://s3dev.estuary.solutions/ovaltine2024dev/64ac9af8-24f1-4dc2-86f6-1923cef7e066", probability: 0.25, color: "white" },
                    { id: 5, name: "Điện thoại", type: "image", value: "https://s3dev.estuary.solutions/ovaltine2024dev/bda0db2f-f354-4a90-91c8-36ce183c4f38", probability: 0.0005, color: "#ef0012" },
                    { id: 6, name: "Chúc bạn may mắn lần sau", type: "text", value: "Chúc bạn may mắn lần sau", probability: 0.1498, color: "white" },
                    { id: 7, name: "Máy ảnh", type: "image", value: "https://s3dev.estuary.solutions/ovaltine2024dev/3f8f5ad0-dcc1-4431-b3e7-271d3c990abd", probability: 0.0005, color: "#ef0012" },
                    { id: 8, name: "Thẻ cào", type: "image", value: "https://s3dev.estuary.solutions/ovaltine2024dev/64ac9af8-24f1-4dc2-86f6-1923cef7e066", probability: 0.25, color: "white" }
                ];
                resolve(mockData);
            });
        }

        try {
            // 1. Fetch data lần đầu tiên
            prizes = await getMockPrizes();

            // 2. Vẽ vòng quay lần đầu
            drawWheel();

            // 3. Khởi tạo các module quản lý popup (chỉ chạy 1 lần)
            window.OventinRateManager.initialize();
            
            // Bây giờ callback sẽ là hàm `drawWheel`
            window.OventinPrizeAdder.initialize(prizes, drawWheel);

        } catch (error) {
            console.error("Failed to initialize wheel:", error);
            alert("Không thể tải được vòng quay. Vui lòng thử lại sau.");
        }
    }

    // --- 2. SPIN LOGIC ---
    function handleSpin() {
        if (isSpinning) return;
        if (currentSpins <= 0) {
            alert("Bạn đã hết lượt quay. Vui lòng thêm lượt để tiếp tục!");
            return;
        }
        currentSpins--;
        updateSpinDisplay();
        isSpinning = true;

        // Get the latest probabilities from the manager before spinning
        const prizeProbabilities = window.OventinRateManager.getProbabilities();

        const winningSliceIndex = getWeightedRandomIndex();
        const randomSpins = Math.floor(Math.random() * 6) + 5;
        const targetAngle = winningSliceIndex * sliceAngle + cssOffsetAngle;
        const totalRotation = -(randomSpins * 360 + targetAngle);
        const spinDuration = 5;

        wheelContainer.style.transition = `transform ${spinDuration}s cubic-bezier(0.25, 0.1, 0.25, 1)`;
        wheelContainer.style.transform = `rotate(${totalRotation}deg)`;

        setTimeout(() => {
            const winningSlice = slices[winningSliceIndex];
            const prizeName = winningSlice.getAttribute('data-name');
            prizeNameElement.textContent = prizeName;
            popupOverlay.classList.remove("popup-hidden");

            const finalRotation = totalRotation % 360;
            wheelContainer.style.transition = 'none';
            wheelContainer.style.transform = `rotate(${finalRotation}deg)`;
            wheelContainer.offsetHeight;

            isSpinning = false;
        }, spinDuration * 1000);
    }

    // --- 3. HELPER FUNCTIONS ---
    function getWeightedRandomIndex() {
        // This function now uses the probabilities fetched right before the spin
        const prizeProbabilities = window.OventinRateManager.getProbabilities();
        let rand = Math.random();
        for (let i = 0; i < prizeProbabilities.length; i++) {
            if (rand < prizeProbabilities[i]) return i;
            rand -= prizeProbabilities[i];
        }
        return prizeProbabilities.length - 1; // Fallback
    }

    // NÚT XOAY
    function updateSpinDisplay() {
        spinCountElement.textContent = currentSpins;
    }

    // CLOSE POPUP
    function closePopup() {
        popupOverlay.classList.add("popup-hidden");
    }

    // --- 4. EVENT SPIN ---
    spinBtn.addEventListener("click", handleSpin);
    addSpinsButton.addEventListener('click', () => {
        currentSpins += 10;
        updateSpinDisplay();
    });
    confirmBtn.addEventListener("click", closePopup);

    // --- START FUNCTION LUCKY PRIZE ---
    // initializeWheel();
    initApp();

});



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