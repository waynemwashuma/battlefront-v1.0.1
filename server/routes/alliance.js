import {Router} from 'express'
import { DBpool } from "../constants.js"

const router  = Router()
router.post('/createAlliance', (req, res) => {
    if (!req.session) return res.send('log into your account first');
    if (!req.body.alliname) return res.send('No name specified for the alliance');
    //if (req.session.alliance) return res.send('Cannot create alliance when in one');
    DBpool.query('SELECT * FROM alliances WHERE name=?', [req.body.alliname], (err, results) => {
        if (!err) {
            if (results.length) return res.send('Alliance already exists!');
            DBpool.query("INSERT INTO alliances(name,description,members,bases) VALUES (?,?,?,?)", [
                req.body.alliname, req.body.desc, `leader=${req.session.username};`, 1
            ], (err) => {
                if (err) console.log(err.message);
                if (!err) {
                    res.cookie('alliance', req.body.alliname)
                    res.send('alliance made successfully');
                    updatePlayerAllianceInSql(req.session.username, req.body.alliname);
                    updatePlayerAllianceInGame(req.session.username, req.body.alliname)
                }
            })
        }
    })
});
router.post('/allianceInfo', (req, res) => {
    if (!req.sessionID) return res.status().send('loginto your account first');
    if (!req.body.alliname) return res.send('No name specified for the alliance');
    if (req.body.alliname == '*') {
        DBpool.query('SELECT name, members, bases FROM alliances', [req.body.alliname], (err, results) => {
            if (!err) {
                res.status(200).json(results)
            }
        })
        return
    }
    DBpool.query('SELECT name,description, members, bases FROM alliances WHERE name=?', [req.body.alliname], (err, results) => {
        if (!err) {
            res.status(200).json(results[0])
        }
    })
});
router.post('/leaveAlliance', (req, res) => {
    let members;
    if (!req.body.alliname.length) return res.send('Action cannot be done');
    if (!req.session) return res.send('Log back in');
    DBpool.query('SELECT * FROM alliances WHERE name = ?', [req.body.alliname], (err, results) => {
        if (!err) {
            if (!results.length) return res.send('no such alliance exists')
            if (!results[0].members.includes(req.session.username)) return res.send('You are not in this alliance');
            members = results[0].members.split(';') || [];
            for (let i = 0; i < members.length; i++) {
                if (members[i].includes('leader') && members[i].includes(req.session.username)) return res.send('You cannot leave alliance as you are the leader')
                if (!members[i].includes(req.session.username)) continue;
                DBpool.query("UPDATE alliances SET members = ? WHERE name=?", [
                    results[0].members.replace(members[i] + ';', ''), req.body.alliname
                ], (err) => {
                    if (err) console.log(err.message);
                    if (!err) {
                        updatePlayerAllianceInSql(req.session.username, req.body.alliname)
                        updatePlayerAllianceInGame(req.session.username, req.body.alliname)
                    }
                });
                break
            }
            res.cookie('alliance', '')
            return res.send('You left the alliance');
        }
        if (err) console.log(err.message);

    })
})
router.post('/joinAlliance', function (req, res) {
    if (!req.session) return res.status(500).send('Session ended:Please login and try again');
    if (!req.body.alliname) return res.send('please select a valid alliance');
    DBpool.query('SELECT * FROM alliances WHERE name=?', [req.body.alliname], (err, results) => {
        if (!err) {
            if (!results.length) return res.send('No such alliance exists');
            if (results[0].members.includes(req.session.username)) return res.send('Already in this alliance');
            DBpool.query('UPDATE alliances SET members = ? WHERE  name=?', [results[0].members.concat(`member=${req.session.username};`), req.body.alliname]);
            res.cookie('alliance', results[0].name);
            updatePlayerAllianceInGame(req.session.username, results[0].name)
            updatePlayerAllianceInSql(req.session.username, results[0].name)
            res.send('Joined alliance successfully');
        }
        if (err) console.log(err.message)
    })
});
router.delete('/disbandAlliance', (req, res) => {
    let leader, members;
    if (!req.session) return res.send('log into your account');
    if (!req.body.alliname) return res.send('No name specified for the alliance');
    //if (req.session.alliance) return res.send('Cannot create alliance when in one');
    DBpool.query('SELECT * FROM alliances WHERE name=?', [req.body.alliname], (err, results) => {
        if (!err) {
            if (!results.length) return res.send('No such alliance exists!');
            members = results[0].members.split(';')
            leader = members[0];
            if (!leader.includes(req.session.username)) return res.send('Forbidden as you are not the alliance leader');
            members.forEach(member => {
                updatePlayerAllianceInSql(member.split('=')[1], '');
                updatePlayerAllianceInGame(member.split('=')[1], '')
            });
            DBpool.query("DELETE FROM alliances WHERE name = ?", [
                results[0].name
            ], (err) => {
                if (err) console.log(err.message);
                res.cookie('alliance', '')
                res.status(200).send('Alliance has been disbanded');
            })
        }
    })
});
router.delete('/player', (req, res) => {
    if (req.session) return res.send('Please log in to delete your account');
    DBpool.query('SELECT * FROM users WHERE uid=?', [req.session.uid], (err, results) => {
        if (!err) {
            if (!results.length) return res.send('No such user exists');
            if (results[0].members.includes(req.session.username)) return res.send('Already in this alliance');
            DBpool.query('DELETE FROM users WHERE uid = ?', [req.session.uid], (err) => {
                if (err) console.log(err.message);
                DBpool.query('DELETE FROM players WHERE uid = ?', [req.session.uid], (err) => {
                    if (err) console.log(err.message);
                    res.status(200).redirect('/signup')
                })
            })

        }
        if (err) console.log(err.message)
    })
});
export {router as AllianceRouter}