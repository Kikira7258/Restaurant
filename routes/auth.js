var express = require('express');
const req = require('express/lib/request');
const res = require('express/lib/response');
var router = express.Router();
const conn = require('../db')


// Display the login page
router.get('/login', function(req, res, next){
    res.render('login', {
        email: '',
        password: '',
        messages: {
            error: "",
            success: ""
        }
    })
})


// authenticate user
router.post('/login', function(req, res, next) {
    var email = req.body.email;
    var password = req.body.password;

    conn.query('SELECT * FROM user WHERE email = ? AND BINARY password = ?', [email, password], function(err, rows, fields) {

        console.log(rows.length);

        if (err || rows.length <= 0) {
            // req.flash('error', 'Invalid credentials, please try again!')
            res.redirect('/admin/login')
            console.log(err)
        } else {
            req.session.isLoggedIn = true
            res.redirect('/active-orders')

        }
    })
})





// // Display login page
// router.post('/login', (req, res, next)=> {
//     conn.query('SELECT * FROM user WHERE email = ? AND BINARY password = ?', [email, password], function(err, rows, fields) {
//         console.log(rows.length);
//         if (rows.length <= 0) {
//             req.flash('error', 'Invalid credentials, Please try again!')
//             res.redirect('/customer');
//         }
//     })
// })

module.exports = router
// exports.router = router // When exporting one item