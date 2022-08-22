var codes = {
    actioncodes: {
        creation: 1001,
        occupation: 1010,
        damage: 1100,
        destruction: 1000,
        movement: 11100
    },
    objcodes: {
        tank: 100,
        APC: 200,
        flak: 300,
        base: 500
    }
}
let user = {
    name: '----',
    id: 0,
    alliance: '-----'
}
let logintime = Date.now();
var mouse = (() => {
    let objs = [];
    let x = 0, y = 0, lastX, lastY, downX, downY;
    let direction = [0, 0], speed = 0, dragging = false,draggBoxAvailalbe = false;
    function inDragBox(pos, width, height) {
        if (
            pos.x - height / 2 <= origin.x - padding ||
            pos.x + height / 2 >= origin.x + innerWidth + padding ||
            pos.y - width <= origin.y - padding ||
            pos.y + width >= origin.y + innerHeight + padding) {
            return false
        }
        return true
    }
    function getMag(x, y) {
        return Math.sqrt(Math.pow(y, 2) + Math.pow(x, 2));
    };
    function drawMouseDragBox(ctx,originX,originY) {
        ctx.beginPath();
        ctx.fillStyle = 'rgba(0,0,133,0.3)';
        ctx.strokeStyle = 'rgba(0,0,255,0.3)';
        ctx.lineWidth = 5;
        ctx.fillRect(x + originX,y + originY);
        ctx.stroke();
        ctx.closePath();
    }
    addEventListener('touchstart', function (e) {
        console.log(true);
        if (e.buttons == 1) {
            downX = e.clientX;
            downY = e.clientY;
            dragging = true;
        } else if(e.buttons == 2 ){
            draggBoxAvailalbe = true
        }

    });
    addEventListener('mousedown', function (e) {
        if (e.buttons == 1) {
            downX = e.clientX;
            downY = e.clientY;
            dragging = true;
        } else if(e.buttons == 2 ){
            draggBoxAvailalbe = true
        }

    });
    addEventListener('touchend', function (e) {
        dragging = false;
    });
    addEventListener('mouseup', function (e) {
        dragging = false;
    });
    addEventListener('touchmove', function (e) {
        lastX = x;
        lastY = y;
        x = e.pageX;
        y = e.pageY;
        if (dragging) {
            speed = getMag(x - lastX, y - lastY);
            direction[0] = x - lastX !== 0 ? (x - lastX) / speed : 0;
            direction[1] = y - lastY !== 0 ? (y - lastY) / speed : 0;
        }
    });
    addEventListener('mousemove', function (e) {
        lastX = x;
        lastY = y;
        x = e.pageX;
        y = e.pageY;
        if (dragging) {
            speed = getMag(x - lastX, y - lastY);
            direction[0] = x - lastX !== 0 ? (x - lastX) / speed : 0;
            direction[1] = y - lastY !== 0 ? (y - lastY) / speed : 0;
        }
    });
    addEventListener('click', () => {
        speed = 0;
    });
    setInterval(() => {
        let redTime = 0.5;
        speed = speed > redTime && !dragging ? speed - redTime : speed > redTime && dragging ? speed : 0;
    }, 100);
    return {
        get x() {
            return x
        },
        get y() {
            return y
        },
        get velX() {
            return speed * direction[0]
        },
        get velY() {
            return speed * direction[1]
        },
        get isDragging() {
            return dragging
        },
        on: function (event, callback,el = window) {
            el.addEventListener(event, callback)
        },
        get getObjs() {
            return objs
        },
        addObjs: function (...ob) {
            objs.push(...ob)
        },
        clearObjs: function () {
            objs = [];
        }
    }
})();






var windowRenderer = (function () {
    let origin = {
        x: 0,
        y: 0
    },
        padding = 200;
    let mapWIDTH = 20000;
    let mapHEIGHT = 4000;
    ; (function windowUpdate() {
        //console.log(mouse.velX,mouse.velY);
        origin.y += mouse.velY;
        origin.x += mouse.velX;
        requestIdleCallback(windowUpdate);
    })();
    function canRenderInWindow(pos, width, height) {
        if (
            pos.x - height / 2 <= origin.x - padding ||
            pos.x + height / 2 >= origin.x + innerWidth + padding ||
            pos.y - width <= origin.y - padding ||
            pos.y + width >= origin.y + innerHeight + padding) {
            return false
        }
        return true
    }
    return {
        get x() {
            return origin.x
        },
        get y() {
            return origin.y
        },
        /**
         * @param {number} x
         */
        set setX(x) {
            origin.x = x;
            return origin.x
        },
        /**
         * @param {number} y
         */
        set setY(y) {
            origin.y = y;
            return origin.y
        },
        addX:function (x) {
            origin.x += x;
        },
        addY:function (y) {
            origin.y += y;
        },
        canRender: canRenderInWindow
    }
})();

setInterval(() => {
    //console.log(windowRenderer.x);
}, 40);

addEventListener('keydown', e => {
    switch (e.key) {
        case 'ArrowUp' || 'Up':
            windowRenderer.addY(100);
            break;
        case 'ArrowDown' || 'Down':
            windowRenderer.addY(-100);
            break;
        case 'ArrowLeft' || 'Left':
            windowRenderer.addX(100);
            break;
        case 'ArrowRight' || 'Right':
            windowRenderer.addX(-100);

            break;
    }
})