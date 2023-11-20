import {Router} from 'express'
import { conn,gen } from "../constants.js"
import crypto from "crypto"
import { addBase } from '../game/index.js'

function hasBase(params) {
    
}
const router  = Router()
router.get('/', (req, res) => {
    if ((req.cookies.remember === '1' || req.cookies.forward === '1') && req.session.authenticated) {
        conn.query('SELECT * FROM players WHERE name = ?', [req.session.uname], (err, results) => {
            if (!err) {
                if (!hasBase(req.session.uname)) {
                    let id = gen.next().value;
                    addBase({ name: req.session.uname, alliance: req.session.alliance || '', id: req.session.uid }, id)
                };
                //res.cookie('alliance', results[0].alliance);
                res.render('game')
            }
            if (err) console.log(err.message);
        })
        return
    };
    if (!req.session.authenticated || req.cookies.remember === '0') return res.status(308).redirect('./login');
    res.status(308).redirect('./signup');
})
router.get('/login', (req, res) => {
    res.render('login', { error: '' })
})
router.post('/login', function (req, res) {
    if (!req.body.username || !req.body.pwd) return res.render('login', { error: 'Fill all fields!' });
    conn.query("SELECT * FROM users WHERE userName = ? OR userMail = ? ", [
        req.body.username, req.body.email
    ], (err, results) => {
        if (!err) {
            conn.query('SELECT * FROM players WHERE name = ?', [req.body.username], (err, result) => {
                if (!result.length && results.length) return res.render('login', { error: 'username does not exist' });
                if (!result.length) return res.render('login', { error: 'please try logging in again' }) && resolveNewPlayer(req.body.username, req);
                if (results[0].userPwd !== hash(req.body.pwd)) return res.render('login', { error: 'You provided a wrong password' });
                req.session.uname = req.body.username;
                req.session.uid = results[0].uid;
                req.session.authenticated = true;
                if (!req.body.remember) res.cookie('remember', 0, { maxAge: new Date(Date.now() + 360000) });
                if (req.body.remember) res.cookie('remember', 1, { maxAge: new Date(Date.now() + 360000) });
                res.cookie('forward', '1', { httpOnly: true, maxAge: 1000 * 60 });
                res.cookie('sessId', req.sessionID, { maxAge: new Date(Date.now() + 3600000), httpOnly: true });
                res.cookie('name', req.body.username, { maxAge: new Date(Date.now() + 3600000), overwrite: true });
                res.status(308).redirect('/');
            })

        }
        if (err) console.log(err.message);
    });
});
router.get('/signup', (req, res) => {
    res.render('signup', { error: '' })
});
router.post('/signup', (req, res) => {
    if (!req.body.username || !req.body.pwd || !req.body.conpwd || !req.body.email) return res.render('signup', { error: 'fill all fields!' });;
    if (req.body.pwd !== req.body.conpwd) res.render('signup', { error: 'password and its confirmtion do not match' });
    let hashpwd = hash(req.body.pwd);
    conn.query("SELECT * FROM users WHERE userName = ? OR userMail = ? ", [
        req.body.username, req.body.email
    ], (err, results) => {
        if (!err) {
            if (results.length) return res.render('signup', { error: 'username or email taken' });
            conn.query("INSERT INTO users(userName,userMail,userPwd) VALUES (?,?,?)", [
                req.body.username, req.body.email, hashpwd
            ], err => { if (err) console.log(err.message) })
            resolveNewPlayer(req.body.username, req)
            req.session.authenticated = true;
            req.session.uname = req.body.username;
            res.cookie('forward', '1', { httpOnly: true, maxAge: 1000 * 60 });
            res.cookie('sessId', req.sessionID, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 });
            res.cookie('name', req.body.username, { maxAge: 360000, overwrite: true });
            if (!req.body.remember) res.cookie('remember', 0, { maxAge: new Date(Date.now() + 360000) });
            if (req.body.remember) res.cookie('remember', 1, { maxAge: new Date(Date.now() + 360000) });
            res.status(308).redirect('/')
            console.log('new user ::: ', req.body.username);
        }
        if (err) console.log(err.message);
    });
})
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.render('login', { error: '' })
})

function hash(data) {
    return crypto.createHash('sha512').update(data).digest('hex')
}
function resolveNewPlayer(name, req) {
    conn.query('SELECT * FROM users WHERE userName = ? OR userMail = ?', [name, name], (err, results) => {
        if (!err) {
            conn.query('INSERT INTO players(uid,name,score,bases) VALUES (?,?,?,?)', [results[0].uid, results[0].userName, 0, 1], (err) => {
                if (err) console.log(err.message);
                req.session.uid = results[0].uid;
            });
        }
        if (err) console.log(err.message);
    })
}

export {router as UserRouter}