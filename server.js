//////server global variables////
const sessionHandler = require('express-session');
const resHandler = require('./resHandler');
const crypto = require('crypto');
const db = require('./db')
const cookie = require('cookie');
const express = require('express');
const app = express();
const mysqlStore = require('express-mysql-session')(sessionHandler);
const http = require('http').createServer(app);
const port = process.env.PORT || 3000;
const io = require('socket.io').Server;
var mysql = require('mysql');
const cookieParser = require('cookie-parser');
var conn = mysql.createConnection(db.users);
console.log(__dirname);
conn.connect(function (err) {
    if (err) console.log(err.message);
    console.log(" mysql Connected!");
});
const sessionStore = new mysqlStore(db.sessionConfig);
app.use(sessionHandler({
    key:'keyin',
    secret:'hgvdsuv83rvuy3vaea',
    resave:false,
    saveUninitialized:true,
    store:sessionStore
}))
const server = new io(http, {
    cors: {
        origin: []
    }
});
//session variable storage
let clients = new Map();
function Client(sessid, uid, name, socketid) {
    this.sessId = sessid
    this.name = name;
    this.uid = uid;
    this.online = true;
    this.lastOnline = null;
    this.lastlogin = null;
    this.resHandler = new resHandler();
    this.socketid = socketid;
}
function hash(data) {
    return crypto.createHash('sha512').update(data).digest('hex')
}
///binds server to a port
http.listen(port, function () {
    console.log('listening on port' + port);
});
let config = {
    secret: 'uygGVBYYG8yG&12ygYg6637GRV4C',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000, secure: false, httpOnly: true, secure: false },
    store:sessionStore
}
app.use(sessionHandler(config))
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '4kb' }));
app.post('/login', function (req, res) {
    if (!req.body.username || !req.body.pwd) return res.send('Fill all fields!');
    conn.query("SELECT * FROM users WHERE userName = ? OR userMail = ? ", [
        req.body.username, req.body.email
    ], (err, results) => {
        if (!err) {
            if (!results.length) return res.send('username does not exist');
            if (results[0].userPwd !== hash(req.body.pwd)) return res.send('You provided a wrong password')
            req.session.uname = req.body.username;
            req.session.uid = results[0].userId;
            req.session.authenticated = true;
            res.cookie('sessId', req.sessionID, { maxAge: 1000 * 60*60*24,httpOnly:true });
            res.cookie('name', req.body.username, { maxAge: new Date(Date.now() + 360000), overwrite: true });
            if (hasBase(req.body.username)) return;
            addBase({ name: req.body.username, alliance: '', level: 0, id: results[0].userId }, gen.next().value)
            res.redirect('./game.html')
        }
    });
});
app.post('/signup', function (req, res) {
    if (!req.body.username || !req.body.pwd || !req.body.conpwd || !req.body.email) return res.send('fill all fields');;
    if (req.body.pwd !== req.body.conpwd) return console.log('passwords do not match!');
    let hashpwd = hash(req.body.pwd);
    conn.query("SELECT * FROM users WHERE userName = ? OR userMail = ? ", [
        req.body.username, req.body.email
    ], (err, results) => {
        if (!err) {
            if (results.length) return res.send('username or email taken');
            conn.query("INSERT INTO users(userName,userMail,userPwd) VALUES (?,?,?)", [
                req.body.username, req.body.email, hashpwd
            ]);
            req.session.authenticated = true;
            req.session.name = req.body.username;
            res.cookie('sessId', req.sessionID,{httpOnly:true,maxAge:1000*60*60*24});
            res.redirect('./game.html')
            res.cookie('name', req.body.username, { maxAge: 360000, overwrite: true });
            addBase({ name: req.body.username, alliance: '', level: 0 }, gen.next().value);
            console.log('new user ::: ',req.body.username);
        }
    });
});
app.post('/createAlliance', function (req, res) {
    if (!req.sessionID) return res.send('log into your account first');
    if (req.body.name) return res.send('No name specified for the alliance');
    //if (req.session.alliance) return res.send('Cannot create alliance when in one');
    conn.query('SELECT * FROM alliances WHERE name=?', [req.body.alliname], (err, results) => {
        if (!err) {
            if (results.length) return res.send('Alliance already exists!');
            conn.query("INSERT INTO alliances(name,desciption,members,bases) VALUES (?,?,?,?)", [
                req.body.alliname, req.body.desc, `leader=${req.session.uname};`, 1
            ], (err) => {
                if (err) return;
                res.redirect('./game.html');
            })
        }
    })
});
app.post('/allianceInfo', (req, res) => {
    if (!req.sessionID) return res.status().send('loginto your account first');
    if (!req.body.alliname) return res.send('No name specified for the alliance');
    if (req.body.alliname == '*') {
        conn.query('SELECT name, members, bases FROM alliances', [req.body.alliname], (err, results) => {
            if (!err) {
                res.status(200).json(results)
            }
        })
        return
    }
    conn.query('SELECT name,desciption, members, bases FROM alliances WHERE name=?', [req.body.alliname], (err, results) => {
        if (!err) {
            res.status(200).json(results[0])
        }
    })
});
app.post('/leaveAlliance', (req, res) => {
    let members;
    if (!req.body.alliname.length) return res.send('Action cannot be done');
    console.log(req.session.uname)
    if (!req.session.uname) return;
    conn.query('SELECT * FROM alliances WHERE name = ?', [req.body.alliname], (err, results) => {
        if (!err) {
            if (!results[0].members.includes(req.session.uname)) return res.send('You are not in this alliance');
            members = results[0].members.split(';') || [];
            for (let i = 0; i < members.length; i++) {
                if (members[i].includes('leader') && members[i].includes(req.session.uname)) return res.send('You cannot leave alliance as you are the leader')
                if (!members[i].includes(req.session.uname)) continue;
                conn.query("UPDATE alliances SET members = ? WHERE name=?", [
                    results[0].members.replace(members[i]+';',''), req.body.alliname
                ]);
                break
            }
            return res.send('You left the alliance')
        }
        if (err) console.log(err.sqlMessage);

    })
})
app.post('/joinAlliance', function (req, res) {
    if (!req.cookies.sessId) return res.status(500).send('session ended:Please login and try again');
    if (!req.body.alliname) return res.send('please select a valid alliance');
    conn.query('SELECT * FROM alliances WHERE name=?', [req.body.alliname], (err, results) => {
        if (!err) {
            console.log('results::', results);
            if (!results.length) return res.send('No such alliance exists');
            console.log('one::', results[0].members);
            if (results[0].members.includes(req.session.uname)) return res.send('Already in this alliance');
            results[0].members = results[0].members.concat(`member=${req.session.uname};`)
            console.log('two::', results[0].members);
            conn.query('UPDATE alliances SET members = ? WHERE  name=?', [results[0].members, req.body.alliname])
            res.send('Joined alliance successfully')
        }
        if (err) console.log(err.sqlMessage)
    })
});
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login.html')
})
app.use('/',express.static('./public'));
///////global game variables///
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
var initialProductionCost = {
    tank: {
        steel: 45000,
        aluminium: 30000
    },
    APC: {
        steel: 65000,
        aluminium: 100000
    },
    flak: {
        concrete: 45000,
        steel: 20000
    }
};
function deductFromRes(socketid, objString) {
    for (const value of clients.values()) {
        if (value.socketid === socketid) {
            let c = Object.keys(initialProductionCost[objString]);
            for (let i = 0; i < c.length; i++) {
                value.resHandler.res.actual[c[i]] -= initialProductionCost[objString][c[i]];
            }
            return true
        }
    }
    return false
}
server.use((socket, next) => {
    if (typeof socket.handshake.headers.cookie !== "string") next(new Error('unathorized'));
    if (!cookie.parse(socket.handshake.headers.cookie).sessId) {
        next(new Error('unathorized'));
    }
    next()
})
server.on('connection', socket => {
    console.log('socket oi connected to client');
    console.log(socket.handshake.headers.cookie);
    if (typeof socket.handshake.headers.cookie === "string") {
        var sid = cookie.parse(socket.handshake.headers.cookie), sd;
        //find way to close socket connection
        if (typeof sid.sessId === "undefined") {
            console.log('no session made');
        } else {
            conn.query('SELECT * FROM sessions WHERE sessId=?',[sid.sessId],(err,results)=>{
                if (!err) {
                    if (!results.length) return console.log('session is invalid');
                    sd = JSON.parse(results[0].data);
                    clients.forEach(c => {
                        for (const [key, value] of clients.entries()) {
                            if (sd.uid === value.uid) {
                                clients.set(socket.id, value)
                                value.socketid = socket.id;
                                value.online = true;
                                value.sessId = sid.sessId;
                                clients.delete(value.socketid);
                            }
                        }
                    });
                    let client = new Client(sid.sessId, sd.uid, sd.name, socket.id);
                    clients.set(socket.id, client);
                }
                if (err) console.log(err.sqlMessage);
            })
        }
    }
    gameLib.bases.forEach(b => {
        socket.emit('firstConnect-bases', [b.pos.x, b.pos.y, b.id, b.whose, b.flaks.length]);
    });
    gameLib.tanks.forEach(b => {
        socket.emit('firstConnect-tanks', [b.pos.x, b.pos.y, b.id, b.whose, b.deg]);
    });
    gameLib.APCs.forEach(b => {
        socket.emit('firstConnect-APCs', [b.pos.x, b.pos.y, b.id, b.whose, b.deg]);
    });
    socket.on(codes.actioncodes.occupation.toString(), e => {
        if (!validateObjBelongToSender(gameLib.APCs.get(e[1]), socket.id)) return;
        moveToCaptureBase(gameLib.bases.get(e[0]), gameLib.APCs.get(e[1]));
    })
    socket.on(codes.objcodes.tank.toString() + codes.actioncodes.creation.toString(), e => {
        if (!gameLib.bases.has(e)) return;
        deductFromRes(socket.id, 'tank')
        if (!validateObjBelongToSender(gameLib.bases.get(e), socket.id)) return;
        creations.push(new CreationCard(codes.objcodes.tank, gameLib.bases.get(e)))
    });
    socket.on(codes.objcodes.APC.toString() + codes.actioncodes.creation.toString(), e => {
        if (!gameLib.bases.has(e)) return;
        deductFromRes(socket.id, 'APC')
        if (!validateObjBelongToSender(gameLib.bases.get(e), socket.id)) return;
        creations.push(new CreationCard(codes.objcodes.APC, gameLib.bases.get(e)))
    });
    socket.on(codes.objcodes.flak.toString() + codes.actioncodes.creation.toString(), e => {
        deductFromRes(socket.id, 'flak');
        if (!gameLib.bases.has(e)) return;
        if (!validateObjBelongToSender(gameLib.bases.get(e), socket.id)) return;
        creations.push(new CreationCard(codes.objcodes.flak, gameLib.bases.get(e)))
    });
    socket.on(codes.actioncodes.movement.toString(), e => {
        if (gameLib.tanks.has(e[0])) {
            if (!validateObjBelongToSender(gameLib.tanks.get(e[0]), socket.id)) return;
            gameLib.tanks.get(e[0]).moveTo.unshift(...avoidAllCollision(new Vector(e[1].x, e[1].y), gameLib.tanks.get(e[0]), gameLib.bases))
        };
        if (gameLib.APCs.has(e[0])) {
            if (!validateObjBelongToSender(gameLib.APCs.get(e[0]), socket.id)) return;
            gameLib.APCs.get(e[0]).moveTo.unshift(...avoidAllCollision(new Vector(e[1].x, e[1].y), gameLib.APCs.get(e[0]), gameLib.bases))
        };
    });
    socket.on('disconnect', () => {
        if (!clients.has(socket.id)) return;
        console.log(`Player disconnected ::: id:${socket.id}`);
        clients.get(socket.id).lastOnline = Date.now();
        clients.get(socket.id).online = false;
    })
});
//////////game logic and etc//////////////
/////modify to fit with server standards
//////utility functions///////
function* generator() {
    for (let i = 0; i < Infinity; i++) {
        yield i
    }
}
const gen = generator();
//vector class
class Vector {
    constructor(x, y, z) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
        this.mag = function () {
            return Math.sqrt(Math.pow(this.y, 2) + Math.pow(this.x, 2) + Math.pow(this.z, 2));
        };
        Vector.prototype.copy = function () {
            return new Vector(this.x, this.y, this.z)
        }
        Vector.prototype.add = function (v) {
            this.x = this.x + v.x;
            this.y = this.y + v.y;
            this.z = this.z + v.z;
            return this
        };
        Vector.prototype.subtract = function (v) {
            this.x = this.x - v.x;
            this.y = this.y - v.y;
            this.z = this.z - v.z;
            return this
        };
        Vector.prototype.dot = function (v) {
            return this.x * v.x + this.y * v.y + this.z * v.z;
        };
        Vector.prototype.mult = function (n) {
            return new Vector(this.x * n, this.y * n, this.z * n);
        };
        Vector.div = function (n) {
            if (n == 0) {
                return new Vector();
            }
            return new Vector(this.x / n, this.y / n, this.z / z)
        }
        Vector.prototype.normalize = function () {
            return new Vector(this.x / this.mag(), this.y / this.mag(), this.z / this.mag());
        };
        Vector.prototype.tangent2d = function () {
            let v = this.normalize();
            return new Vector(-v.y, v.x);
        };
        Vector.prototype.draw = function (ct, startX = 0, startY = 0, color = 'red') {
            ct.save();
            ct.beginPath();
            ct.moveTo(startX, startY);
            ct.strokeStyle = color;
            ct.lineTo(startX + this.x, startY + this.y);
            ct.stroke();
            ct.closePath();
            ct.restore();
            return this
        };
        Vector.prototype.rotate = function (rad) {
            this.x = this.x * Math.cos(rad) - this.y * Math.sin(rad);
            this.y = this.x * Math.sin(rad) + this.y * Math.cos(rad);
        };
        Vector.prototype.toArr = () => {
            return [
                this.x,
                this.y,
            ];
        };
        Vector.prototype.toObj = () => {
            return {
                x: this.x,
                y: this.y,
                z: this.z
            }
        }
        Vector.prototype.reflectX = () => {
            this.x = -this.x;
        }
        Vector.prototype.reverse = () => {
            this.x = -this.x;
            this.y = -this.y;
            this.z = -this.z;
        }
    }
    get x_axis() {
        return new Vector(1)
    }
    static getDegBtwnVectors(v1, v2) {
        return Math.acos(v1.dot(v2) / (v1.mag() * v2.mag())) * 180 / Math.PI
    }
    static getAbsDegBtwnVectors(v1, v2, t) {
        //goes anticlockwise
        let absDeg = Vector.getDegBtwnVectors(v1, v1.x_axis);
        absDeg = v1.y > 0 ? absDeg : 360 - absDeg;
        v1.rotate(absDeg * Math.PI / 180);
        v2.rotate(absDeg * Math.PI / 180);
        return v2.y > 0 ? Vector.getDegBtwnVectors(v1, v2) : 360 - Vector.getDegBtwnVectors(v1, v2)
    }
    static DegToUN(deg) {
        return new Vector(Math.cos(deg * Math.PI / 180), Math.sin(deg * Math.PI / 180))
    }
}
//creations class
let creations = [], captures = [];
function emitGameError(error, id) {
    server.sockets.to(id).emit('game-error', error)
}
function validateObjBelongToSender(obj, id) {
    if (clients.has(id)) {
        if (clients.get(id).uid === obj.whose.id) {
            return true
        }
    }
    return false
}
function CreationCard(objcode, base) {
    this.base = base;
    this.timer = 0;
    this.code = objcode;
    switch (objcode) {
        case codes.objcodes.tank:
            this.timer = 6;
            break;
        case codes.objcodes.APC:
            this.timer = 2;
            break;
        case codes.objcodes.flak:
            this.timer = 2;
            break;
    }
    CreationCard.prototype.remove = function (arr) {
        console.log('new object added to library');
        this.base.isSpawning = false;
        this.base.spawn(this.code);
        arr.remove(this);
    }
}
function CaptureCard(base, apc) {
    this.apc = apc;
    this.base = base;
    CaptureCard.prototype.capture = function () {
        console.log(base.actualSpawnPoint.copy().subtract(apc.pos.copy()).mag());
        if (base.actualSpawnPoint.copy().subtract(apc.pos.copy()).mag() < 10) {
            apc.capture(this.base, gameLib.APCs)
            captures.remove(this);
        }
    }
}
function objsAreAlly(obj1, obj2) {
    if (obj1.whose.id == obj2.whose.id || obj1.whose.alliance == obj2.whose.alliance && obj2.whose.alliance.length) return true;
    return false
}
function moveToCaptureBase(base, obj) {
    if (base.whose.name == obj.whose.name || base.whose.alliance == obj.whose.alliance) {
        clients.forEach(c => {
            if (c.name == obj.whose.name) {
                emitGameError('You cannot capture an allied base', c.socketid)
            }
        });
        return
    }
    if (base.flaks.length > 0) {
        console.log('flaks are many',base.flaks.length);
        clients.forEach(c => {
            if (c.name == obj.whose.name) {
                server.to(c.socketid).emit('game-error', 'flaksleft');
            }
        });
        return
    }
    console.log('..capturing');
    obj.moveTo.push(...avoidAllCollision(new Vector(base.actualSpawnPoint.x, base.actualSpawnPoint.y + 150), obj, gameLib.bases))
    obj.moveTo.push(base.actualSpawnPoint.copy());

    captures.push(new CaptureCard(base, obj));
}
Array.prototype.commonValues = function (arr) {
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
        let t = sorted.commonValues(sorted2);
        return [sorted[0], t[0]]
    }
    return [sorted[0]]
}
function avoidAllCollision(destination, obj, arr) {
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
let gameLib = {
    bases: new Map(),
    tanks: new Map(),
    APCs: new Map()
}
//////closure variables///////
//variables for base class;
let mapWidth = 20000, mapHeight = 20000;
let baseWidth = 700, baseHeight = 400, turrentSpacing = 5, turrentRadius = 20, maxFlaks = 10, spawnWidth = 250, spawnHeight = 100;

//variables for flak class
let flakHeight, flakWidth, flakRadius = 20;
/////classes for game objects///////
//vehicle class
class Vehicle {
    constructor(x, y, id, whose, deg) {
        this.pos = new Vector(x, y);
        this.deg = deg || 0;
        this.Undeg;
        this.w = 100;
        this.h = 50;
        this.whose = whose;
        this.reload = 1000;
        this.health = 100;
        this.moveTo = [];
        this.id = id;
        this.vel = new Vector(1, 1);
        Vehicle.prototype.move = function () {
            if (this.moveTo.length) {
                if (this.rotate()) {
                    if (circle_collider(this.pos, this.moveTo[0], 5)) {
                        this.moveTo.shift();
                    }
                    this.pos.add(this.vel);
                    server.emit(codes.actioncodes.movement, [this.id, this.pos])
                }
            }
        };
        Vehicle.prototype.removeAsHealth0 = function name(arr) {
            if (this.health < 1) {
                this.remove(arr);
                server.emit(codes.actioncodes.destruction.toString(), [this.name, this.id])
            }
        }
        Vehicle.prototype.remove = function (arr) {
            server.emit(codes.actioncodes.destruction.toString(), [this.name, this.id])
            arr.delete(this.id)
        }
        Vehicle.prototype.rotate = function () {
            this.Undeg = Vector.getDegBtwnVectors(this.moveTo[0].copy().subtract(this.pos), Vector.DegToUN(this.deg));
            if (this.Undeg < 2) {
                this.vel = Vector.DegToUN(this.deg).mult(5);

                return true;
            }
            --this.deg;
            server.emit('vehicle-rotate', [this.id, this.deg]);
            return false;
        };
    }
}
//apc class
class APC extends Vehicle {
    constructor(x, y, id, whose, deg) {
        super(x, y, id, whose, deg);
        this.name = 'APC';
        APC.prototype.capture = function (obj, arr) {
            obj.whose = this.whose;
            this.remove(arr);
            server.emit('base-rename', [obj.id, this.whose])
        };
    }
}
//tank class
class Tank extends Vehicle {
    constructor(x, y, id, whose, deg) {
        super(x, y, id, whose, deg);
        this.name = 'tank';
        this.turrent = new Turrent(this.pos.x, this.pos.y, this.id);
        Tank.prototype.drawAll = function (ct, originX, originY) {
            this.draw(ct, originX, originY);
            this.turrent.draw(ct, originX, originY);
        }
        Tank.prototype.updateTurrent = function () {
            let id;
            this.turrent.pos = this.pos;
            this.target = this.turrent.track(this, gameLib.tanks);
            this.target = this.target ? this.target : this.turrent.track(this, gameLib.APCs);
            this.target = this.target ? this.target : this.turrent.trackFlaks(this, gameLib.bases)
            if (this.target instanceof Array) {
                id = this.target[1]
                this.target = this.target[0]
            }
            if (this.target) {
                if (this.turrent.rotate(this.target)) {
                    if (this.turrent.reload <= 0) {
                        this.turrent.fireOn(this.target, id)
                    }
                }
            }
        }
    }
}
//flak class
function Flak(x, y, deg, id) {
    this.id = id;
    this.name = 'flak';
    this.health = 100;
    this.pos = new Vector(x, y);
    this.deg = deg;
    this.Undeg;
    this.r = flakRadius;
    this.range = 1000;
    this.damage = 2;
    this.reload = 0;
    Flak.prototype.trackFlak = (obj, base) => {
        if (circle_collider(base.spawnPoint, obj.pos, this.range) && !objsAreAlly(obj, base)) {
            return [base.flaks[base.flaks.length - 1], base.id]
        }
        return false
    }
    Flak.prototype.trackFlaks = (obj, arr) => {
        let flak;
        for (const e of arr.values()) {
            if (flak = this.trackFlak(obj, e)) {
                return flak;
            }
        }
        return false
    }
    Flak.prototype.track = function (obj, arr) {
        //this should be in the base class:::done
        for (const e of arr.values()) {
            if (circle_collider(this.pos, e.pos, this.range) && !Object.is(obj, e) && !objsAreAlly(obj, e)) {
                return e;
            }
        }

        return false
    }
    Flak.prototype.track = function (obj, arr) {
        //this should be in the base class:::done
        for (const e of arr.values()) {
            if (circle_collider(this.pos, e.pos, this.range) && !Object.is(obj, e) && !(e.whose.id == obj.whose.id || e.whose.alliance == obj.whose.alliance)) {
                return e;
            }
        }
        return false
    }
    Flak.prototype.removeAsHealth0 = function name(arr, base) {
        if (this.health < 1) {
            this.remove(arr);
            server.emit(codes.actioncodes.destruction.toString(), [this.name, base.id])
        }
    }
    Flak.prototype.remove = function (arr) {
        arr.remove(this)
    }
    Flak.prototype.rotate = function (obj, thisid) {
        this.Undeg = Vector.getDegBtwnVectors(obj.pos.copy().subtract(this.pos), Vector.DegToUN(this.deg))
        if (this.Undeg < 2) {
            return true
        }
        this.deg++;
        server.emit('flak-rotate', [this.name, this.id, this.deg, thisid]);
        return false
    }
    Flak.prototype.fireOn = function (obj, thisid) {
        if (this.reload <= 0) {
            server.emit('fire', [this.name, this.id, obj.id, thisid])
            obj.health -= this.damage;
            this.reload = 10000;
        }
    }
}
//turrent class
class Turrent extends Flak {
    constructor(x, y, id) {
        super(x, y, 90, id);
        this.name = 'turrent';
        this.range = 500;
        this.reload = 2000;
    }
}
//base class
function Base(x, y, id, whose) {
    this.name = 'base';
    this.id = id;
    this.pos = new Vector(x, y);
    this.w = baseWidth;
    this.h = baseHeight;
    this.vertice = [
        new Vector(x, y),
        new Vector(x + this.w, y),
        new Vector(x + this.w, y + this.h),
        new Vector(x, y + this.h)
    ];
    this.movePoints = [
        new Vector(x - 70, y - 70),
        new Vector(x + this.w + 70, y - 70),
        new Vector(x + this.w + 70, y + this.h + 70),
        new Vector(x - 70, y + this.h + 70)
    ]
    this.flaks = [];
    this.whose = whose;
    this.center = new Vector(x + this.w / 2, y + this.h / 2);
    this.spawnPoint = new Vector(this.center.x - spawnWidth / 2, this.pos.y + this.h);
    this.fireCenter = new Vector(this.center.x, this.spawnPoint.y);
    this.isSpawning = false;
    this.actualSpawnPoint = new Vector(this.spawnPoint.x + spawnWidth / 2, this.spawnPoint.y + spawnHeight / 2);
    function spawnMoveForward(obj) {
        obj.moveTo.push(new Vector(obj.pos.x, obj.pos.y + 300))
    }
    function determineFlakpos(that, n) {
        let xt = n % 2 ? that.center.x + spawnWidth / 2 + ((turrentRadius + turrentSpacing) * (n / 2 - 0.5)) + ((n / 2 + 0.5) * turrentRadius) : that.center.x - spawnWidth / 2 - ((turrentRadius + turrentSpacing) * (n / 2)) - ((n / 2 + 1) * turrentRadius);
        return [xt, that.pos.y + that.h + turrentRadius + turrentSpacing];
    }
    function addFlak(that) {
        if (that.flaks.length >= maxFlaks) return;
        let flak = new Flak(...determineFlakpos(that, that.flaks.length), 0, that.flaks.length);
        that.flaks.push(flak);
    }
    Base.prototype.spawn = function (code) {
        let obid = gen.next().value,
            t;
        switch (code) {
            case codes.objcodes.tank:
                t = new Tank(this.actualSpawnPoint.x, this.actualSpawnPoint.y, obid, this.whose, 90);
                gameLib.tanks.set(obid, t);
                server.emit(codes.objcodes.tank.toString() + codes.actioncodes.creation.toString(), [t.pos.x, t.pos.y, t.id, t.whose, t.deg]);
                break;
            case codes.objcodes.APC:
                t = new APC(this.actualSpawnPoint.x, this.actualSpawnPoint.y, obid, this.whose, 90);
                gameLib.APCs.set(obid, t);
                server.emit(codes.objcodes.APC.toString() + codes.actioncodes.creation.toString(), [t.pos.x, t.pos.y, t.id, t.whose, t.deg]);
                break;
            default:
                addFlak(this);
                server.emit(codes.objcodes.flak.toString() + codes.actioncodes.creation.toString(), [this.id, this.flaks[this.flaks.length - 1].pos]);
                break;
        }
        if (t) spawnMoveForward(t);
    }
    Base.prototype.flakCollider = function (arr) {
        for (const obj of arr.values()) {
            let done = false;
            ///second if parameter after && shpuld be alliance or id -done
            if (circle_collider(this.fireCenter, obj.pos, 250) && !objsAreAlly(this, obj)) {
                for (let i = 0; i < this.flaks.length; i++) {
                    if (this.flaks[i].rotate(obj, this.id)) {
                        this.flaks[i].fireOn(obj, this.id);
                        done = true;
                    }
                }
            }
            if (done) break;
        }
    }
}
function checkIfbaseLapping(x, y) {
    for (const val of gameLib.bases.values()) {
        if (circle_collider(val.center.copy(), new Vector(x + baseWidth / 2, y + baseHeight / 2), 1600)) {
            return true
        }
    }
    return false
}
function hasBase(name) {
    for (const vl of gameLib.bases.values()) {
        if (vl.whose.name == name) return true;
    }
    return false
}
function addBase(whose, id) {
    let x = randomIntFromRange(700, mapWidth),
        y = randomIntFromRange(700, mapHeight);
    while (checkIfbaseLapping(x, y)) {
        x = randomIntFromRange(700, mapWidth);
        y = randomIntFromRange(700, mapHeight)
    }
    gameLib.bases.set(id, new Base(x, y, id, whose));
    console.log(gameLib.bases.get(id).whose);
    server.emit('base-creation', [x, y, id, whose])
}
function initBases(n) {
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
        let base = new Base(x, y, id, { name: '', alliance: '' });
        b.push(base)
        base.spawn(codes.objcodes.flak)
        gameLib.bases.set(id, base);
    }
};
initBases(50);
////////////the game logic loops/////////////
let lastcall;
//for fast canvas
function mainloop() {
    gameLib.bases.forEach(base => {
        base.flakCollider(gameLib.tanks);
        base.flakCollider(gameLib.APCs);
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
    clients.forEach(c => {
        c.resHandler.update(Date.now(), () => {
            server.sockets.to(c.socketid).emit('res-update', c.resHandler.res.actual)
        })
    })
}, 1000);
setInterval(() => {
    conn = mysql.createConnection(db.users)
  }, 1000 * 60 * 60 * 6)