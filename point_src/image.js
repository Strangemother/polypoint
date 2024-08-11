
const image = function(ctx, src) {
    const img = new Image();

    img.addEventListener("load", () => {
        ctx.drawImage(img, 0, 0);
    });

    img.src = src;
}