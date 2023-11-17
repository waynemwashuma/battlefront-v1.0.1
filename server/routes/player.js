import {Router} from 'express'
import { conn } from "../constants.js"

const router  = Router()
router.delete('/player', (req, res) => {
    if (req.session) return res.send('Please log in to delete your account');
    conn.query('SELECT * FROM users WHERE uid=?', [req.session.uid], (err, results) => {
        if (!err) {
            if (!results.length) return res.send('No such user exists');
            if (results[0].members.includes(req.session.uname)) return res.send('Already in this alliance');
            conn.query('DELETE FROM users WHERE uid = ?', [req.session.uid], (err) => {
                if (err) console.log(err.message);
                conn.query('DELETE FROM players WHERE uid = ?', [req.session.uid], (err) => {
                    if (err) console.log(err.message);
                    res.status(200).redirect('/signup')
                })
            })

        }
        if (err) console.log(err.message)
    })
});
router.post('/playerInfo', (req, res) => {
    if (!req.sessionID) return res.status().send('log into your account first');
    if (!req.body.playername) return res.send('No name specified for the player');
    if (req.body.playername == '*') {
        conn.query('SELECT * FROM players', [req.body.playername], (err, results) => {
            if (!err) res.status(200).json(results)
        })
        return
    }
    conn.query('SELECT * FROM players WHERE name=?', [req.body.playername], (err, results) => {
        if (!err) res.status(200).json(results[0]);
    });
});
export {router as PlayerRouter}