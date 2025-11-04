let formCrud = document.getElementById("form");
let inputCrud = document.getElementById("input");
let msg = document.getElementById("msg");
let posts = document.getElementById("posts");

let data = {};
let acceptData = () => {
    data["text"] = input.value;
    console.log(data);
    createPost();
};
let deletePost = (a) => {
    //2 lần parentElement để xoát hết từ phần tử cha tới phần tử kế thừa, 3 class thì để 3 lần
    a.parentElement.parentElement.remove();
};
let editPost = (a) => {
  inputCrud.value = a.parentElement.previousElementSibling.innerHTML;
  a.parentElement.parentElement.remove();
};

formCrud.addEventListener("submit", (a) => {
    a.preventDefault();
    console.log("button clicked");
    formValidation();
});

let formValidation = () => {
    if (inputCrud.value === "") {
        msg.innerHTML = "Post cannot be blank";
        console.log("failure");
    } else {
    acceptData();
    }
};

let createPost = () => {
    // posts.innerHTML += dùng để tăng phần tử khi tạo mới, còn dùng posts.innerHTML thì chỉ hiện 1 lần duy nhất
  posts.innerHTML += `
  <div>
    <p>${data.text}</p>
    <span class="options">
      <i onClick="editPost(this)" class="fas fa-edit"></i>
      <i onClick="deletePost(this)" class="fas fa-trash-alt"></i>
    </span>
  </div>
  `;
  input.value = "";
};



