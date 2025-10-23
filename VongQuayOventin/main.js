document.addEventListener("DOMContentLoaded", () => {
    const wheel = document.querySelector(".container-wheel");
    const spinBtn = document.getElementById("spin");
    const slices = document.querySelectorAll(".container-wheel-part");

    const sliceCount = slices.length; // Số lượng ô (8)
    const sliceAngle = 360 / sliceCount; // Góc của mỗi ô (45 độ)
    let isSpinning = false;
    let currentRotation = 0;

    spinBtn.addEventListener("click", () => {
        // Không cho phép quay khi đang quay
        if (isSpinning) {
            return;
        }
        isSpinning = true;

        // 1. Chọn một ô ngẫu nhiên để trúng thưởng
        const winningSliceIndex = Math.floor(Math.random() * sliceCount);

        // 2. Tính toán góc quay
        // Thêm số vòng quay ngẫu nhiên (ví dụ: 5 đến 10 vòng) để tạo hiệu ứng
        const randomSpins = Math.floor(Math.random() * 6) + 5;

        // Góc cần đến để dừng lại ở ô trúng thưởng.
        // Mũi tên ở trên cùng (0 độ), và chúng ta quay ngược chiều kim đồng hồ.
        // Góc của ô trúng thưởng = (index * góc mỗi ô).
        const cssOffsetAngle = -22.5; // Góc lệch ban đầu từ CSS
        const targetAngle = winningSliceIndex * sliceAngle + cssOffsetAngle;

        // Tổng góc quay = (số vòng quay * 360) + góc dừng
        // Dấu trừ vì chúng ta muốn quay ngược chiều kim đồng hồ để khớp với thứ tự ô
        const totalRotation = -(randomSpins * 360 + targetAngle);

        // 3. Thực hiện animation quay
        const spinDuration = 5; // 5 giây
        wheel.style.transition = `transform ${spinDuration}s cubic-bezier(0.25, 0.1, 0.25, 1)`; // ease-out
        wheel.style.transform = `rotate(${totalRotation}deg)`;

        // 4. Hiển thị kết quả sau khi quay xong
        setTimeout(() => {
            const winningSlice = slices[winningSliceIndex];
            const prizeName = winningSlice.getAttribute('data-name');
            alert(`Chúc mừng! Bạn đã trúng: ${prizeName}`);
            isSpinning = false;
        }, spinDuration * 1000);
    });
});
