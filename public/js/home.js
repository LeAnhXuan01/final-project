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