let creations = [];
function ResHandler(initres) {
    this.lastLogin = logintime - 100000;
    let productionTime = 10000;
    this.res = {
            concrete: 400,
            steel: 3564,
            aluminium: 646545,
            military: 0,
            bases: 4
        }
    let a = Object.keys(this.res);
    //output values to the screen
    let resUI = [];
    for (let i = 0; i < a.length; i++) {
        resUI.push(document.getElementById('res\-' + a[i] + '\-no'))
    }
    //console.log(resUI);
    function updateUI(that) {
        return async function () {
            for (let i = 0; i < resUI.length; i++) {
                resUI[i].innerHTML = '';
                resUI[i].append(document.createTextNode(that.res[a[i]]))
            }
        }

    };
    setInterval(updateUI(this), 100);
}

let r = new ResHandler();
socket.on('res-update',data=>{
    r.res = data;
})
let baseMenu = new (function Menu() {
    this.base = null;
    this.buttons = [];
    this.imurl = [];
    this.x = 50;
    this.y = 40;
    this.w = 200;
    this.h = 75;
    this.active = false;
    let a = Object.keys(codes.objcodes);
    function Button(x, y, objcode, img) {
        this.w = 45;
        this.h = 45;
        this.img = img;
        this.color = 'rgba(0,235,244,0.8)';
        this.x = x;
        this.y = y;
        this.objcode = objcode;
        this.state = 'defualt'
        Button.prototype.draw = function (ct) {
            ct.beginPath();
            ct.fillStyle = this.color;
            ct.fillRect(this.x, this.y, this.w, this.h);
            //ct.drawImage(this.img,this.x,this.y)
            ct.closePath();
        }
        Button.prototype.remove = (arr) => {
            arr.remove(this)
        }
    }

    Menu.prototype.remove = async function () {
        //console.log('removed');
        this.buttons.forEach(b => {
            b.remove(this.buttons)
        })
        this.active = false;
    }
    Menu.prototype.updateButtons = () => {
        for (let i = 0; i < this.buttons.length; i++) {
            this.buttons[i].x = this.x + 50 * i;
            this.buttons[i].y = this.y + 10;
        }
    }
    Menu.prototype.initbuttons = () => {
        if (this.buttons.length) return this.updateButtons();
        for (let i = 1; i < 4; i++) {
            this.buttons.push(new Button(this.x + 50 * i, this.y + 10, codes.objcodes[a[i - 1]]))
        }
    }
    this.initbuttons();
    Menu.prototype.init = function (b) {
        this.x = b.pos.x + 80 + windowRenderer.x;
        this.y = b.pos.y + 50 + windowRenderer.y;
        this.initbuttons();
        this.active = true;
    }
    Menu.prototype.draw = function (ct) {
        if (!this.active) return;
        ct.beginPath();
        ct.fillStyle = 'rgba(100,100,255,0.7)';
        ct.fillRect(this.x, this.y, this.w, this.h);
        this.buttons.forEach(b => {
            b.draw(ct)
        });
        ct.closePath();
    }
    function clickbutton(that) {
        return () => {
            that.buttons.forEach(b => {
                if (
                    mouse.x > b.x &&
                    mouse.x < b.x + b.w &&
                    mouse.y > b.y &&
                    mouse.y < b.y + b.h &&
                    that.active
                ) {
                    if (that.base.isSpawning) return;
                    that.base.isSpawning = true;
                    creations.push(new CreationCard(b.objcode, that.base))
                }
            })
        }
    }
    function movebutton(that) {
        return () => {
            let t = false;
            gameLib.bases.forEach(b => {
                if (
                    mouse.x > b.pos.x + windowRenderer.x &&
                    mouse.x < b.pos.x + b.w + windowRenderer.x &&
                    mouse.y > b.pos.y + windowRenderer.y &&
                    mouse.y < b.pos.y + b.h + windowRenderer.y
                ) {
                    that.base = b;
                    baseMenu.init(b);
                    t = true;
                }
            });
            if (!t) {
                baseMenu.remove();
                that.base = null;
            }
            that.buttons.forEach(b => {
                if (
                    mouse.x > b.x &&
                    mouse.x < b.x + b.w &&
                    mouse.y > b.y &&
                    mouse.y < b.y + b.h
                ) {
                    b.color = 'rgba(255,100,0,0.8)';
                    return
                }
                b.color = 'rgba(0,235,244,0.8)';
            })
        }
    }
    //////eventlisteners//////
    c[3].addEventListener('click', clickbutton(this));
    c[3].addEventListener('mousemove', movebutton(this))
})();

///initialize the base menu////
// mouse.on('click', () => {
//     let t = false;
//     gameLib.bases.forEach(b => {
//         if (
//             mouse.x > b.pos.x &&
//             mouse.x < b.pos.x + b.w &&
//             mouse.y > b.pos.y &&
//             mouse.y < b.pos.y + b.h
//         ) {
//             baseMenu.init(b);
//             t = true;
//         }
//     });
//     if (!t) baseMenu.remove();

// })








function CreationCard(objcode, base) {
    this.x = base.spawnPoint.x;
    this.y = base.spawnPoint.y;
    this.w = 100;
    this.h = 75
    this.base = base;
    this.timer = 0;
    this.code = objcode;
    this.text;
    switch (objcode) {
        case codes.objcodes.tank:
            this.timer = 6;
            this.text = 'tank';
            socket.emit(codes.objcodes.tank.toString() + codes.actioncodes.creation.toString(), base.id);
            break;
        case codes.objcodes.APC:
            this.timer = 2;
            this.text = 'APC';
            socket.emit(codes.objcodes.APC.toString() + codes.actioncodes.creation.toString(),base.id);
            break;
        case codes.objcodes.flak:
            this.timer = 2;
            this.text = 'flak';
            socket.emit(codes.objcodes.flak.toString() + codes.actioncodes.creation.toString(),base.id);
            break;
    }
    CreationCard.prototype.draw = function (ct, originX, originY) {
        ct.beginPath();
        ct.fillStyle = 'rgba(100,100,100,0.7)';
        ct.fillRect(this.x + originX, this.y + originY, this.w, this.h);
        ct.fillStyle = 'white';
        ct.font = '16px verdana';
        let a = ct.measureText(this.text);
        let b = ct.measureText(this.timer);
        ct.fillText(this.text, this.x + a.width + originX, this.y + 70 + originY);
        ct.font = '50px verdana';
        ct.fillText(this.timer, this.x + 22 + originX, this.y + 40 + originY)
        ct.closePath();
    };
    CreationCard.prototype.remove = function (arr) {
        this.base.isSpawning = false;
        arr.remove(this)
    }
}
; (function UIloop(dt) {
    ctx[3].clearRect(0, 0, innerWidth, innerHeight);
    baseMenu.draw(ctx[3]);
    creations.forEach(card => {
        card.draw(ctx[3], windowRenderer.x, windowRenderer.y)
    })
    requestAnimationFrame(UIloop);
})();
setInterval(() => {
    creations.forEach(c => {
        if (c.timer <= 0) {
            c.remove(creations)
        }
        --c.timer;
    })
}, 1000);