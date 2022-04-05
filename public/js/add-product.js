let user = JSON.parse(sessionStorage.user || null);

window.onload = () => {
    if(user == null){
        location.replace('/login')
    }
}

let editables = [...document.querySelectorAll('*[contenteditable="true"]')];

editables.map((element) => {
    let placeholder = element.getAttribute('data-placeholder');
    element.innerHTML = placeholder;
    element.addEventListener('focus', () => {
        if(element.innerHTML == placeholder){
            element.innerHTML = '';
        }
    })
    element.addEventListener('focusout', () => {
        if(!element.innerHTML.length){
            element.innerHTML = placeholder;
        }
    })
})


// edit page
const fetchProductData = () => {
    addProductData.innerHTML = 'save product';
    fetch('/get-products', {
        method : 'post',
        headers: new Headers({'Content-Type': 'application/json'}),
        body: JSON.stringify({id: productId})
    }).then(res => res.json())
    .then(data => {
        setFormData(data)
    })
    .catch(err => console.log(err))
}

const setFormData = (data) => {
    productName.innerHTML = data.name;
    shortDes.innerHTML = data.shortDes;
    price.innerHTML = data.price;
    detail.innerHTML = data.detail;
    tags.innerHTML = data.tags;

    let productImg = document.querySelector('.product-img')
    productImg.src = imagePath = data.image;
}

let productId = null;
if(location.pathname != '/add-product'){
    productId = decodeURI(location.pathname.split('/').pop());
    fetchProductData();
}
