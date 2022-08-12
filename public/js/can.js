let c = document.getElementsByTagName('canvas');
ctx = [];
for (let i = 0; i < 4; i++) {
    ctx.push(c.item(i).getContext('2d'));
}
if (!navigator.userAgentData.mobile) {
    setInterval(() => {
        for (let i = 0; i < ctx.length; i++) {
            document.body.style.width = `${innerWidth}px`;
            document.body.style.height = `${innerHeight}px`;
            c.item(i).width = innerWidth;
            c.item(i).height = innerHeight;
        }
    
    }, 100);
}