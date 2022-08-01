let c = document.getElementsByTagName('canvas');
ctx = [];
for (let i = 0; i < 4; i++) {
    ctx.push(c.item(i).getContext('2d'));
}