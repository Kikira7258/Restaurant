
const express = require('express');
require('dotenv').config({path: './secrets.env'});
const conn = require('./db')
const path = require('path');
const router = express.Router();
// const flash = require('express-flash');
const { response } = require('express');
let ejs = require('ejs');
const { redirect, render } = require('express/lib/response');
const authRouter = require('./routes/auth')
var protect = require('./utils/protect')

// session
const cookieParser = require('cookie-parser')
const session = require('express-session')


const app = express();

// enable the reading of static ejs files
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')

// enable the use of static css files
app.use(express.static(path.join(__dirname, '/public')));

// setting up session
app.use(cookieParser())
app.use(session({
    secret: 's3cr3ts', 
    resave: true,
    saveUninitialized: false,
    cookie: {
        maxAge: 2 * 60 * 1000
    }
}))

// config express server
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/', router);


app.use('/admin', authRouter)



// tells if the database is nonnected or not
conn.connect(function(err) {
    if(err) console.log(err);
    else console.log('Database connected!')
})


app.get('/', function(reg, res) {
    res.render('homepage')
})

// step 2 & 3
app.get('/create-order/:menu_item', function(req, res) {
    res.render('create-order', {
        menu_item: req.params.menu_item
    })
})


// creating the order
app.post('/create-order', function (req, res) {

    // grabbing the data from the form
    var data = {
        email: req.body.email,
        menu_item: req.body.menu_item
    };

    // generating the code
    var code = Date.now().toString().slice(-4);

    // create customer
    conn.query('INSERT INTO customer(email, code) VALUES (?, ?)', [data.email, Number.parseInt(code)],(err, result) => {
        if (err) {
            console.log(err);
           return res.redirect('/create-order/'+data.menu_item)
        }
        // getting the customer id
        var customerId = result.insertId;

        // getting the order number
        conn.query("SELECT * FROM key_ctrl WHERE key_nm = 'ORDER_NUM'", (err, result) => {
            if (err) {
                console.log(err);
               return res.redirect('/create-order/' + data.menu_item)
            }

            // selecting the order number from result
            var orderNum = result[0].key_val;
            
            // creating the order
            conn.query("INSERT INTO orders (order_num,customer_id,menu_item) VALUES (?, ?, ?)", [orderNum,customerId,data.menu_item],(err, result) => {
                if(err) console.log(err);

                res.render('order-code',{
                    order_code: code
                })

                // setting the next order number
                conn.query("UPDATE key_ctrl SET key_val = " + (orderNum + 1) + " WHERE key_nm = 'ORDER_NUM'",(err, result) => {
                    if(err) console.log(err);
                })
            })
        })
    })
})


// 
app.get('/active-orders', protect, function(req, res) {
    conn.query('SELECT menu.*, orders.id AS order_id, customer.email FROM orders, menu, customer WHERE orders.menu_item = menu.id AND orders.customer_id = customer.id', (err, rows, fields) => {
        if(err) {
            res.redirect('/')
        } else {
            res.render('active-orders',{
                orders:rows
            })
        }
    } )
})

app.get('/delete-order/:id', protect, (req, res) => {
    conn.query('DELETE FROM orders WHERE id = ' + req.params.id, (err,result)=>{
        if(err) console.log(err);

        res.redirect('/active-orders')

    })
})




// Fetching fields from the database and sending it to the main page
app.get('/menu', (req, res) => {
    conn.query('SELECT * FROM menu ORDER BY id', (err, rows, fields) => {
        if(!err) {
            res.render('menu', 
            {
                menu: [
                    {item_name: "name",
                    img_url: "image",
                    item_description: "description",
                    item_price: "price"}
                ],
                data: rows
            })  

        } else
            console.log(err)   
    })
})


















// app.get('*', (req, res) => {
//     res.sendFile(`index.html`, { root: www });
// });


const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`listening on http://localhost:${8080}`));
