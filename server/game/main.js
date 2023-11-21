import { baseHeight, baseWidth, codes, gen } from "../constants.js";
import { Vector } from "./math/vector.js";
import {
    Base
} from "./objects/index.js";
import * as clientHandler from "../node_utils/chatconfig.js";
export const creations = [], captures = [];
export function updatePlayerAllianceInGame(clientname, alliance) {
    gameLib.bases.forEach(base => {
        if (base.whose.name === clientname) {
            base.whose.alliance = alliance
        }
    });
    gameLib.tanks.forEach(tank => {
        if (tank.whose.name === clientname) {
            tank.whose.alliance = alliance
        }
    });
    gameLib.APCs.forEach(apc => {
        if (apc.whose.name === clientname) {
            apc.whose.alliance = alliance
        }
    });
    //server.emit('update-alli', clientname, alliance)
}

function commonValues(arr1, arr2) {
    let filteredArray = [];
    for (let i = 0; i < this.length; i++) {
        for (let j = 0; j < arr.length; j++) {
            if (this[i].x == arr[j].x && this[i].y == arr[j].y) {
                filteredArray.push(this[i])
            }
        }
    }
    return filteredArray
}
var linesIntersect = (function () {
    let v1, v2, v3, cross, u1, u2;
    v1 = { x: null, y: null };
    v2 = { x: null, y: null };
    v3 = { x: null, y: null };

    function lineSegmentsIntercept(p0, p1, p2, p3) {
        v1.x = p1.x - p0.x; // line p0, p1 as vector
        v1.y = p1.y - p0.y;
        v2.x = p3.x - p2.x; // line p2, p3 as vector
        v2.y = p3.y - p2.y;
        if ((cross = v1.x * v2.y - v1.y * v2.x) === 0) {  // cross prod 0 if lines parallel
            return false; // no intercept
        }
        v3 = { x: p0.x - p2.x, y: p0.y - p2.y };  // the line from p0 to p2 as vector
        u2 = (v1.x * v3.y - v1.y * v3.x) / cross; // get unit distance along line p2 p3 
        // code point B
        if (u2 >= 0 && u2 <= 1) {                   // is intercept on line p2, p3
            u1 = (v2.x * v3.y - v2.y * v3.x) / cross; // get unit distance on line p0, p1;
            // code point A
            return (u1 >= 0 && u1 <= 1);           // return true if on line else false.
            // code point A end
        }
        return false; // no intercept;
        // code point B end
    }
    return lineSegmentsIntercept
})();
function sortPos(arr, pos) {
    let m = [];
    for (let i = 0; i < arr.length; i++) {
        m.push(arr[i].copy())
    }
    m.sort((a, b) => {
        if (a.copy().subtract(pos).mag() > b.copy().subtract(pos).mag()) return 1;
        if (a.copy().subtract(pos).mag() < b.copy().subtract(pos).mag()) return -1;
        if (a.copy().subtract(pos).mag() === b.copy().subtract(pos).mag()) return 0;
    });
    return m
}
function lineToRect(v1, v2, obs) {
    if (linesIntersect(v1, v2, obs.vertice[0], obs.vertice[1]) ||
        linesIntersect(v1, v2, obs.vertice[1], obs.vertice[2]) ||
        linesIntersect(v1, v2, obs.vertice[2], obs.vertice[3]) ||
        linesIntersect(v1, v2, obs.vertice[3], obs.vertice[0])) {
        return true
    }
    return false
}
function avoidCollision(pos, destination, obs) {
    if (!lineToRect(pos, destination, obs)) return [];
    let sorted = sortPos(obs.movePoints, pos);
    sorted.unshift();
    let sorted2 = sortPos(sorted, destination);
    sorted2.pop();
    sorted2.pop();
    sorted.pop();

    if (lineToRect(sorted[0], destination, obs)) {
        let t = commonValues(sorted, sorted2);
        return [sorted[0], t[0]]
    }
    return [sorted[0]]
}
export function avoidAllCollision(destination, obj, arr) {
    let s = [], t = [];
    arr.forEach(e => {
        if (!lineToRect(obj.pos, destination, e)) return;
        t.push(e)
    });
    t.sort((a, b) => {
        if (a.center.copy().subtract(obj.pos).mag() > b.center.copy().subtract(obj.pos).mag()) return -1;
        if (a.center.copy().subtract(obj.pos).mag() < b.center.copy().subtract(obj.pos).mag()) return 1;
        return 0;
    });
    t.forEach(e => {
        s.push(...avoidCollision(obj.pos, destination, e).reverse())
    })
    s.unshift(destination);
    return s.reverse();
}
//circle colider system
let dirtyvect;
function circle_collider(v1, v2, l) {
    dirtyvect = v2.copy().subtract(v1).mag();
    if (dirtyvect <= l) {
        return true
    }
    return false
}
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
    APC: 2
}
export const gameLib = {
    bases: new Map(),
    tanks: new Map(),
    APCs: new Map(),
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
        }
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
        }
    },
    remove(entity, type) {
        let id = entity.id
        switch (type) {
            case VehicleType.TANK:
                return this.tanks.delete(id)
            case VehicleType.APC:
                return this.APCs.delete(id)
            case VehicleType.BASE:
                return this.bases.delete(id)
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
    let id = gen.next().value
    let x = randomIntFromRange(700, mapWidth),
        y = randomIntFromRange(700, mapHeight);
    while (checkIfbaseLapping(x, y)) {
        x = randomIntFromRange(700, mapWidth);
        y = randomIntFromRange(700, mapHeight)
    }
    const base = new Base(x, y, id, whose)
    gameLib.add(base,VehicleType.BASE);

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
        let base = new Base(x, y, id, { name: '', alliance: '' })
        b.push(base)
        base.spawn(codes.objcodes.flak)
        gameLib.add(base,VehicleType.BASE);
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
    //console.log(creations);
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