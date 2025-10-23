const wheel = document.querySelector(".container-wheel");
const spinBtn = document.getElementById("spin");
const wheelSegments = document.querySelectorAll(".container-wheel-part");

let isSpinning = false;
let currentRotation = 0; // Lưu góc quay hiện tại

// Lấy danh sách giải thưởng từ thuộc tính data-name trong HTML
const prizes = Array.from(wheelSegments).map(segment => segment.dataset.name);

spinBtn.addEventListener("click", () => {
  if (isSpinning) return;
  isSpinning = true;

  // Quay ngẫu nhiên từ 5-10 vòng
  const spinCycles = 5 + Math.random() * 5;
  // Chọn một góc ngẫu nhiên để dừng lại
  const randomStopAngle = Math.floor(Math.random() * 360);

  // Tổng góc quay = góc quay hiện tại + số vòng quay + góc dừng ngẫu nhiên
  const totalRotation = currentRotation + (360 * spinCycles) + randomStopAngle;

  // Cập nhật góc quay hiện tại để lần quay tiếp theo bắt đầu từ vị trí đã dừng
  currentRotation = totalRotation;

  // Thêm hiệu ứng transition để vòng quay mượt mà
  wheel.style.transition = "transform 5s cubic-bezier(0.25, 0.1, 0.25, 1)";
  wheel.style.transform = `rotate(${totalRotation}deg)`;

  // Sau 5 giây, khi vòng quay đã dừng, tính toán và hiển thị kết quả
  setTimeout(() => {
    isSpinning = false;

    // Tính góc cuối cùng (0-359 độ)
    const finalDeg = totalRotation % 360;

    // Mỗi ô chiếm 45 độ (360 / 8)
    // Tính toán index của ô mà mũi tên chỉ vào
    // Do các ô đã được xoay -22.5 độ trong CSS, ta cần cộng lại 22.5 độ để tính toán cho đúng
    const segmentIndex = Math.floor((finalDeg + 22.5) / 45) % 8;

    // Lấy tên giải thưởng từ mảng prizes
    const resultPrize = prizes[segmentIndex];

    alert(`🎉 Chúc mừng! Bạn đã trúng: ${resultPrize} 🎁`);

  }, 5000); // Thời gian này phải khớp với thời gian transition trong CSS
});
