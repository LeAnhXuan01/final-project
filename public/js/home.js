// image collage
 const collagImages = [...document.querySelectorAll('.collage-image')]

collagImages.map((item, i) => {
    item.addEventListener('mouseover', () => {
        collagImages.map((image, index) => {
            if(index != i){
                image.style.filter = 'blur(10px)';
                item.style.zIndex = 2
            }
        })
    })

    item.addEventListener('mouseleave', () => {
        collagImages.map((image, index) => {
            image.style = null;
        })
    })
})

// get product funtion
let productId = null;
const getProducts = (tag) => {
    return fetch('/get-products', {
        method: 'post',
        headers: new Headers({'Content-Type': 'application/json'}),
        body: JSON.stringify({tag: tag})
    })
    .then(res => res.json())
    .then(data => {
        return data
    })
}

const createProductCards = (data, title, ele) => {
    let container = document.querySelector(ele);
    container.innerHTML += `
        <h1 class="section-title">${title}</h1>
        <div class="product-container">
            ${createCards(data)}
        </div>
        `;
}

const createCards = data => {
    let cards = '';

    data.forEach(item => {
        if(item.id != productId){
            cards += `
            <div class="product-card">
                <img src="${item.image}" onclick="location.href = '/product/${item.id}'" class="product-img" alt="">
                <p class="product-name">${item.name}</p>
            </div>
            `
        }
    })
    return cards;
}