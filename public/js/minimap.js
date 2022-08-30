const MiniMap = (function () {
    function objsAreAllyOrNot(obj1,obj2) {
        if ((obj1.whose.id == obj2.id || obj1.whose.alliance == obj2.alliance) && obj1.whose.alliance.length)return true;
        return false
    }
    let colorAlfa = 0.6;
    let colors = {
        red:`rgba(165, 42, 42,${colorAlfa})`,
            blue:`rgba(6, 117, 245,${colorAlfa})`,
        green:`rgba(0, 255, 13,${colorAlfa})`
}
    let mini_c = document.getElementById('mini');
    let miniCtx = mini_c.getContext('2d');
    function convertScale(pos) {
        return [pos.x / mapWidth * mini_c.width, pos.y / mapHeight * mini_c.height];
    }
    miniCtx.scale = 1;
    function drawBase(ctx, base) {
        ctx.beginPath();
        ctx.fillStyle = base.whose.name == user.name ? colors.green : objsAreAllyOrNot(base,user) ? colors.blue : colors.red;
        ctx.arc(...convertScale(base.center), 5, 0, Math.PI * 2)
        ctx.fill();
        ctx.closePath();
    }
    function drawVehicle(ctx, vehicle) {
        ctx.beginPath();
        ctx.fillStyle = vehicle.whose.name == user.name ? ' rgb(0, 255, 13)' : objsAreAllyOrNot(vehicle,user) ? 'rgb(6, 117, 245)' : 'rgb(245, 6, 18)';
        ctx.fillRect(...convertScale(vehicle.pos), 3, 3)
        ctx.closePath();
    }
    function drawWindow(ctx) {
        let t = convertScale({ x: -windowRenderer.x, y: -windowRenderer.y })
        ctx.beginPath();
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'white';
        ctx.strokeRect(...t, 20, 10);
        ctx.moveTo(0, t[1] + 5);
        ctx.lineTo(t[0], t[1] + 5);
        ctx.moveTo(300, t[1] + 5);
        ctx.lineTo(t[0] + 20, t[1] + 5);
        ctx.moveTo(t[0] + 10, 0);
        ctx.lineTo(t[0] + 10, t[1]);
        ctx.moveTo(t[0] + 10, 300);
        ctx.lineTo(t[0] + 10, t[1] + 10);
        ctx.stroke();
        ctx.closePath();
    }
    ; (function miniloop(dt) {
        miniCtx.clearRect(0, 0, mini_c.width, mini_c.height);
        //miniCtx.fillRect(0, 0, 100, 220);
        gameLib.bases.forEach(b => {
            drawBase(miniCtx, b)
        })
        gameLib.tanks.forEach(t => {
            drawVehicle(miniCtx, t)
        })
        gameLib.APCs.forEach(a => {
            drawVehicle(miniCtx, a)
        });
        drawWindow(miniCtx)
        requestAnimationFrame(miniloop)
    })();
    mini_c.addEventListener('click', e => {
        windowRenderer.setX = -(e.offsetX / mini_c.width * mapWidth) + c.item(1).width / 2;
        windowRenderer.setY = -((e.offsetY / mini_c.height) * mapHeight) + c.item(1).height / 2;


        //windowRenderer.setY = -((e.offsetY / mini_c.height) * mapHeight)*(c.c1.height/c.c1.width)+c.item(1).height/2;
    })
})();

