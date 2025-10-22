let container = document.querySelector(".container-wheel");
let btn = document.getElementById("spin");
let number = Math.ceil(Math.random() * 10000);

let flash = document.querySelector(".container-wheel div");


btn.onclick = function () {
  container.style.transform = "rotate(" + number + "deg)";
  number += Math.ceil(Math.random() * 10000);

}
  
