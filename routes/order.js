var express = require('express');
var router = express.Router();
var conn = require('./app');
var protect = require('../utils/protect')



// router.use(protect)

// display the login page
router.get('/orders',  function(reg, res) {

    var newKey = getNewKey();
    res.render('orders', {
        order_num: newKey
    })
})




function getNewKey(){
    var retVal;
    conn.query("SELECT * FROM orders WHERE id = 'order_num'", function(err, row) {
        if(err) {
            console.log(row[0].id);
            retVal = row[0].id;
        } else {
            console.log(err);
        }
            
    });
        console.log(retVal);
        return retVal;
}

module.exports = router;