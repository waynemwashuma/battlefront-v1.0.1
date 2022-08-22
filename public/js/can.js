let container = document.querySelector('#can-div');
console.log(container);
let c = document.getElementsByTagName('canvas');
ctx = [];
for (let i = 0; i < 4; i++) {
    ctx.push(c.item(i).getContext('2d'));
}
window.addEventListener('resize',resizer())
function resizer() {
    for (let i = 0; i < ctx.length; i++) {
        c.item(i).height = innerHeight;
        c.item(i).width = innerWidth;
        container.style.height = innerHeight + "px";
        container.style.width = innerWidth + "px";
    }
    if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/i)) {
        return () => {
            for (let i = 0; i < ctx.length; i++) {
                c.item(i).height = innerHeight;
                c.item(i).width = innerWidth;
                container.style.height = innerHeight + "px";
                container.style.width = innerWidth + "px";
            }

        }
    }
    return () => {
        for (let i = 0; i < ctx.length; i++) {
            c.item(i).width = innerWidth;
            c.item(i).height = innerHeight;
        }

    }
}
