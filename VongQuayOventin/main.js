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
    const prizeIdElement = document.getElementById("popup-prize-id");
    const confirmBtn = document.getElementById("popup-confirm-btn");

    // Popup thêm quà
    const showProbabilitiesBtn = document.getElementById('show-probabilities-btn');
    const addPrizeBtn = document.getElementById('add-prize-btn');
    const restartBtn = document.getElementById('restart-btn');

    // // API Simulator elements
    // const jsonInputArea = document.getElementById('json-input-area');
    // const updateFromJsonBtn = document.getElementById('update-from-json-btn');
    // const addPrizePopupOverlay = document.getElementById('add-prize-popup-overlay');
    // const addPrizeCloseBtn = document.getElementById('add-prize-close-btn');

    // Game State
    let prizes = [];
    let slices = [];
    let sliceCount = 0;
    let sliceAngle = 0;
    let cssOffsetAngle = 0;
    let isSpinning = false;
    let currentSpins = 5;

    // --- 1. INITIALIZE THE WHEEL ---
    // vẽ vòng quay không fetch lại dữ liệu.
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

                    const namePrize = document.createElement('span');
                    namePrize.textContent = prize.name;
                    namePrize.className = 'prize-name-display'; // Class để style tên quà
                    slice.appendChild(namePrize);
                } else {
                    const p = document.createElement('p');
                    p.textContent = prize.value;
                    p.className = 'p-wheel';
                    slice.appendChild(p);
                }

                // // Thêm ID của quà vào mỗi ô
                // const idElement = document.createElement('span');
                // idElement.textContent = `${prize.id}`;
                // idElement.className = 'prize-id-display'; // Class để có thể tùy chỉnh CSS sau này
                // slice.appendChild(idElement);

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
        // const API_FILE_URL = 'luckywheel.json';
        const LOCAL_STORAGE_KEY = 'oventinPrizes';
        // const LOCAL_STORAGE_KEY = 'oventinPrizes'; // Sẽ không dùng LocalStorage cho danh sách quà nữa
        const API_URL = 'http://localhost:3000/prizes'; // API endpoint từ json-server

        // Mock data để làm dữ liệu mặc định
        function getMockPrizes() {
            return new Promise(resolve => {
                const mockData = [
                    {   id: 1, 
                        name: "Điện thoại", 
                        type: "image", 
                        value: "https://s3dev.estuary.solutions/ovaltine2024dev/bda0db2f-f354-4a90-91c8-36ce183c4f38", 
                        probability: 0.0005, 
                        color: "#ef0012" 
                    },
                    { id: 2, name: "Good luck", type: "text", value: "Chúc bạn may mắn lần sau", probability: 0.14, color: "#ffffff" },
                    { id: 3, name: "Máy ảnh", type: "image", value: "https://s3dev.estuary.solutions/ovaltine2024dev/3f8f5ad0-dcc1-4431-b3e7-271d3c990abd", probability: 0.0005, color: "#ef0012" },
                    { id: 4, name: "Thẻ cào", type: "image", value: "https://s3dev.estuary.solutions/ovaltine2024dev/64ac9af8-24f1-4dc2-86f6-1923cef7e066", probability: 0.25, color: "#ffffff" },
                    { id: 5, name: "Điện thoại", type: "image", value: "https://s3dev.estuary.solutions/ovaltine2024dev/bda0db2f-f354-4a90-91c8-36ce183c4f38", probability: 0.0005, color: "#ef0012" },
                    { id: 6, name: "Good luck", type: "text", value: "Chúc bạn may mắn lần sau", probability: 0.14, color: "#ffffff" },
                    { id: 7, name: "Máy ảnh", type: "image", value: "https://s3dev.estuary.solutions/ovaltine2024dev/3f8f5ad0-dcc1-4431-b3e7-271d3c990abd", probability: 0.0005, color: "#ef0012" },
                    { id: 8, name: "Thẻ cào", type: "image", value: "https://s3dev.estuary.solutions/ovaltine2024dev/64ac9af8-24f1-4dc2-86f6-1923cef7e066", probability: 0.25, color: "#ffffff" }
                ];
                resolve(mockData);
            });
        }

        try {
            // 1. Kiểm tra Local Storage để tải dữ liệu
            const savedPrizes = localStorage.getItem(LOCAL_STORAGE_KEY);
            
            if (savedPrizes) {
                // Nếu có dữ liệu trong Local Storage, sử dụng nó
                prizes = JSON.parse(savedPrizes);
                console.log("Loaded prizes from Local Storage.");
            } else {
                // Nếu Local Storage trống, thực hiện quy trình tải lần đầu
                console.log("Local storage is empty. Initializing data...");

                // Bước 1: Luôn tải dữ liệu gốc từ getMockPrizes()
                prizes = await getMockPrizes();
                console.log("Loaded initial data from getMockPrizes().");

                // Bước 2: Dùng GET để lấy dữ liệu từ API và gộp vào
                try {
                    console.log(`Fetching additional data from API: ${API_URL}`);
                    const response = await fetch(API_URL);
                    if (response.ok) {

                        const apiPrizes = await response.json();
                        if (apiPrizes && apiPrizes.length > 0) {
                            
                            // Tìm ID lớn nhất hiện có để bắt đầu gán ID cho dữ liệu từ API
                            let maxId = prizes.length > 0 ? Math.max(...prizes.map(p => p.id)) : 0;
                            // Gán ID cho các phần quà từ API
                            apiPrizes.forEach(prize => {
                                prize.id = ++maxId;
                            });
                            // Gộp dữ liệu từ API vào mảng prizes và json-server tự quản lý add ID
                            prizes = prizes.concat(apiPrizes);
                            console.log(`Successfully merged ${apiPrizes.length} prize(s) from API.`);
                        } else {
                            console.log("API returned no new prizes. Using only mock data.");
                        }
                    } else {
                        console.warn(`API call failed with status: ${response.status}. Using only mock data.`);
                    }
                } catch (apiError) {
                //     prizes = await response.json();
                //     localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(prizes));
                    console.error("Could not fetch from API. Using only mock data.", apiError);
                }

                // Bước 3: Lưu dữ liệu đã gộp vào Local Storage
                // stringify chuyển dạng json sang chuỗi để localstorage có thể lưu và lcstorage ko thể lưu object và array
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(prizes));
                console.log("Saved combined data to Local Storage.");
            }

            // 2. Vẽ vòng quay lần đầu
            drawWheel();
            // 3. Khởi tạo các module quản lý popup (chỉ chạy 1 lần)
            window.OventinRateManager.initialize(drawWheel);
            // Bây giờ callback sẽ là hàm `drawWheel`
            window.OventinPrizeAdder.initialize(prizes, drawWheel);

        } catch (error) {
            console.error("Failed to initialize wheel:", error);
            alert("Không thể tải được vòng quay. Vui lòng thử lại sau.");
        }
    }

    restartBtn.addEventListener('click', () => {
        localStorage.clear(); 
        location.reload();
    });

    // --- 2. SPIN LOGIC ---
    function handleSpin() {
        // Ngăn người dùng nhấn quay khi vòng quay đang trong quá trình thực hiện
        if (isSpinning) return;

        // Kiểm tra xem người dùng còn lượt quay hay không
        if (currentSpins <= 0) {
            alert("Bạn đã hết lượt quay. Vui lòng thêm lượt để tiếp tục.");
            return;
        }

        // Trừ 1 lượt quay của người dùng
        currentSpins--;
        // Cập nhật lại số lượt quay hiển thị trên giao diện
        updateSpinDisplay();
        // Đặt trạng thái vòng quay thành "đang quay"
        isSpinning = true;
        showProbabilitiesBtn.disabled = true;
        addPrizeBtn.disabled = true;
        restartBtn.disabled = true;
        showProbabilitiesBtn.style.cursor = 'not-allowed';
        addPrizeBtn.style.cursor = 'not-allowed';
        restartBtn.style.cursor = 'not-allowed';

        // Lấy mảng tỉ lệ trúng thưởng mới nhất từ module RateManager
        const prizeProbabilities = window.OventinRateManager.getProbabilities();

        // Xác định ô quà trúng thưởng dựa trên tỉ lệ đã lấy
        const winningSliceIndex = getWeightedRandomIndex();
        // Tạo một số vòng quay ngẫu nhiên (từ 5 đến 10 vòng) để tạo hiệu ứng hồi hộp
        const randomSpins = Math.floor(Math.random() * 6) + 5;
        // Tính toán góc cần dừng lại. `cssOffsetAngle` là góc lệch ban đầu để mũi tên chỉ vào giữa ô đầu tiên.
        const targetAngle = winningSliceIndex * sliceAngle + cssOffsetAngle;
        // Tính tổng góc mà vòng quay cần xoay. Dấu trừ để quay ngược chiều kim đồng hồ.
        const totalRotation = -(randomSpins * 360 + targetAngle);
        const spinDuration = 5;

        // Áp dụng hiệu ứng chuyển động (transition) cho vòng quay
        wheelContainer.style.transition = `transform ${spinDuration}s cubic-bezier(0.25, 0.1, 0.25, 1)`;
        // Bắt đầu quay vòng quay đến góc đã tính toán
        wheelContainer.style.transform = `rotate(${totalRotation}deg)`;

        // Đặt hẹn giờ để thực hiện các hành động sau khi vòng quay đã dừng hẳn
        setTimeout(() => {
            // Lấy thông tin của ô quà đã trúng thưởng
            const winningSlice = slices[winningSliceIndex];
            // Lấy tên của món quà từ thuộc tính data-name
            const prizeName = winningSlice.getAttribute('data-name');
            // Lấy ID của món quà từ thuộc tính data-id
            const prizeId = winningSlice.getAttribute('data-id');
            // Hiển thị tên quà trúng thưởng lên popup
            prizeNameElement.textContent = prizeName;
            popupOverlay.classList.remove("popup-hidden"); // Hiện popup
            document.body.classList.add('body-no-scroll'); // Chặn cuộn
            prizeIdElement.textContent = `  _ ID: ${prizeId}`;

            // Reset lại vòng quay để chuẩn bị cho lần quay tiếp theo
            const finalRotation = totalRotation % 360; // Tính toán góc dừng cuối cùng (từ 0 đến -360 độ)
            // Tắt hiệu ứng chuyển động để việc đặt lại góc không bị animation
            wheelContainer.style.transition = 'none';
            // Đặt lại góc của vòng quay về góc dừng cuối cùng
            wheelContainer.style.transform = `rotate(${finalRotation}deg)`;
            // Một "mẹo" nhỏ để trình duyệt áp dụng ngay lập tức thay đổi CSS ở trên
            wheelContainer.offsetHeight;

            showProbabilitiesBtn.disabled = false;
            addPrizeBtn.disabled = false;
            restartBtn.disabled = false;
            showProbabilitiesBtn.style.cursor = '';
            addPrizeBtn.style.cursor = '';
            restartBtn.style.cursor = '';

            // Đặt lại trạng thái vòng quay thành "đã dừng"
            isSpinning = false;
        }, spinDuration * 1000);
    }

    // --- 3. HELPER FUNCTIONS ---
    /*
     * Chọn một index (vị trí) của quà một cách ngẫu nhiên, có trọng số (dựa trên tỉ lệ).
     * Ví dụ: Nếu tỉ lệ là [0.1, 0.7, 0.2], thì quà ở index 1 có 70% cơ hội được chọn.
     * Cách hoạt động:
     * 1. Tạo một số ngẫu nhiên `rand` từ 0 đến 1.
     * 2. Lặp qua mảng tỉ lệ. Ở mỗi bước, kiểm tra xem `rand` có nhỏ hơn tỉ lệ hiện tại không.
     *    - Nếu có, trả về index hiện tại.
     *    - Nếu không, trừ tỉ lệ đó khỏi `rand` và tiếp tục vòng lặp.
     * Điều này tương đương với việc chia một đoạn thẳng từ 0 đến 1 thành các đoạn nhỏ có độ dài bằng tỉ lệ,
     * và xem `rand` rơi vào đoạn nào.
     */
    function getWeightedRandomIndex() {
        // Lấy mảng tỉ lệ mới nhất từ RateManager. Ví dụ: [0.1, 0.7, 0.2].
        const prizeProbabilities = window.OventinRateManager.getProbabilities();
        // Tạo một số ngẫu nhiên trong khoảng từ 0 (bao gồm) đến 1 (loại trừ).
        let rand = Math.random();
        // Biến để theo dõi tổng tỉ lệ tích lũy.
        let cumulativeProbability = 0;

        // Lặp qua từng tỉ lệ.
        for (let i = 0; i < prizeProbabilities.length; i++) {
            // Cộng tỉ lệ của ô hiện tại vào tổng tích lũy.
            cumulativeProbability += prizeProbabilities[i];

            // Nếu số ngẫu nhiên nhỏ hơn tổng tích lũy,
            // có nghĩa là nó đã "rơi" vào khoảng của ô quà này.
            // Ví dụ: rand=0.5, probs=[0.2, 0.4, 0.4].
            // i=0: cumulative=0.2. 0.5 < 0.2? Không.
            // i=1: cumulative=0.2+0.4=0.6. 0.5 < 0.6? Có. Trả về index 1.
            if (rand < cumulativeProbability) {
                return i;
            }
        }
        // Trường hợp dự phòng (ví dụ: do lỗi làm tròn số), trả về index của phần tử cuối cùng.
        return prizeProbabilities.length - 1;
    }

    // NÚT XOAY
    function updateSpinDisplay() {
        spinCountElement.textContent = currentSpins;
    }

    // CLOSE POPUP
    function closePopup() {
        popupOverlay.classList.add("popup-hidden"); // Ẩn popup
        document.body.classList.remove('body-no-scroll'); // Cho phép cuộn lại
    }

    // --- 4. EVENT SPIN ---
    spinBtn.addEventListener("click", handleSpin);
    addSpinsButton.addEventListener('click', () => {
        currentSpins += 10;
        updateSpinDisplay();
    });
    confirmBtn.addEventListener("click", closePopup);
    
    // --- START FUNCTION LUCKY PRIZE ---
    initApp();

});
