import { baseHeight, baseWidth, codes, gen } from "../constants.js";
import { Vector } from "./math/vector.js";
import {
    Base
} from "./objects/index.js";
import { circle_collider } from "./functions.js";

export const creations = [], captures = [];

Array.prototype.remove = function (value) {
    let w = this.splice(0, this.indexOf(value));
    this.shift();
    this.push(...w);
}
function randomIntFromRange(min, max) {
    return Math.round((Math.random() * (max - min)) + min)
}

/////global variables/////
//game objects` library
export const VehicleType = {
    TANK: 0,
    BASE: 1,
    APC: 2,
    FLAK: 3
}
export const gameLib = {
    bases: new Map(),
    tanks: new Map(),
    APCs: new Map(),
    flaks: new Map(),
    _listeners: {},
    add(entity, type) {
        entity.gameLib = this
        switch (type) {
            case VehicleType.TANK:
                this.tanks.set(entity.id, entity)
                break;
            case VehicleType.APC:
                this.APCs.set(entity.id, entity)
                break;
            case VehicleType.BASE:
                this.bases.set(entity.id, entity)
                break;
            case VehicleType.FLAK:
                this.flaks.set(entity.id, entity)
                break;
        }
        if(entity.init)entity.init(this)
        this.triggerListener('add', {
            type,
            entity
        })
    },
    get(id, type) {
        switch (type) {
            case VehicleType.TANK:
                return this.tanks.get(id)
            case VehicleType.APC:
                return this.APCs.get(id)
            case VehicleType.BASE:
                return this.bases.get(id)
            case VehicleType.FLAK:
                return this.flaks.get(id)
        }
    },
    has(id, type) {
        switch (type) {
            case VehicleType.TANK:
                return this.tanks.has(id)
            case VehicleType.APC:
                return this.APCs.has(id)
            case VehicleType.BASE:
                return this.bases.has(id)
            case VehicleType.FLAK:
                return this.flaks.has(id)
        }
    },
    remove(entity, type) {
        let id = entity.id
        switch (type) {
            case VehicleType.TANK:
                this.tanks.delete(id)
                break
            case VehicleType.APC:
                this.APCs.delete(id)
                break
            case VehicleType.BASE:
                this.bases.delete(id)
                break
            case VehicleType.FLAK:
                entity.parent.flaks.remove(entity)
                this.flaks.delete(id)
                break
        }
        this.triggerListener('remove', {
            type,
            entity
        })
    },
    addListener(name, listener) {
        if (name in this._listeners)
            return this._listeners[name].push(listener)
        this._listeners[name] = [listener]
    },
    triggerListener(name, data) {
        if (!(name in this._listeners)) return
        let list = this._listeners[name]

        for (let i = 0; i < list.length; i++) {
            list[i](data)
        }
    }
}
//variables for base class;
const mapWidth = 20000, mapHeight = 20000;

/////classes for game objects///////
//vehicle class
function checkIfbaseLapping(x, y) {
    for (const val of gameLib.bases.values()) {
        if (circle_collider(val.center.copy(), new Vector(x + baseWidth / 2, y + baseHeight / 2), 1600)) {
            return true
        }
    }
    return false
}
export function hasBase(name) {
    for (const vl of gameLib.bases.values()) {
        if (vl.whose.name == name) return true;
    }
    return false
}
export function addBase(whose) {
    let x = randomIntFromRange(700, mapWidth),
        y = randomIntFromRange(700, mapHeight);
    while (checkIfbaseLapping(x, y)) {
        x = randomIntFromRange(700, mapWidth);
        y = randomIntFromRange(700, mapHeight)
    }
    const base = new Base(x, y, whose)
    gameLib.add(base, VehicleType.BASE);
}
export function initBases(n) {
    let b = [];
    for (let i = 0; i < n; i++) {
        let x = randomIntFromRange(2000, mapHeight);
        let y = randomIntFromRange(2000, mapWidth);
        let id = gen.next().value;
        if (i) {
            for (let j = 0; j < b.length; j++) {
                let e = b[j];

                if (circle_collider(e.center.copy(), new Vector(x + baseWidth / 2, y + baseHeight / 2), 1600)) {
                    j = -1;
                    y = randomIntFromRange(300, mapHeight);
                    x = randomIntFromRange(400, mapWidth);
                }
            }
        }
        let base = new Base(x, y, { name: '', alliance: '' })
        b.push(base)
        gameLib.add(base, VehicleType.BASE);
        base.spawn(codes.objcodes.flak)
    }
};

////////////the game logic loops/////////////
//for fast canvas
function mainloop() {
    gameLib.bases.forEach(base => {
        base.flakCollider();
        base.flaks.forEach(flak => {
            flak.removeAsHealth0(base.flaks, base)
        });
    })
    gameLib.tanks.forEach((tank) => {
        tank.updateTurrent();
        tank.removeAsHealth0(gameLib.tanks);
        tank.move();
    });
    gameLib.APCs.forEach(apc => {
        apc.move();
        apc.removeAsHealth0(gameLib.APCs);
    })
}
setInterval(mainloop, 1000 / 60);
setInterval(() => {
    gameLib.bases.forEach(base => {
        base.flaks.forEach(flak => {
            flak.reload -= 1000
        })
    });
    gameLib.tanks.forEach(tank => {
        tank.turrent.reload -= 1000
    })
    creations.forEach(c => {
        if (c.timer <= 0) {
            c.remove(creations)
        }
        --c.timer;
    });
    captures.forEach(c => {
        c.capture();
    })
    gameLib.triggerListener('res-update')
}, 1000);