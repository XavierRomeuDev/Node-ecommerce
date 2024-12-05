const express = require('express');
const router = express.Router();

const { catchErrors } = require('../handlers/errorHandlers');
const productController = require('../controllers/productController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const shoppingCartController = require('../controllers/shoppingCartController');
const orderController = require('../controllers/orderController');
const paypal = require('../controllers/paypal.js');

router.get('/extendinglayout/', (req, res) => {

    menu = [
        { slug: '/products', title: 'Productes', icon: 'Productes', },
        { slug: '/add', title: 'Afegir', icon: 'Afegir', },
        { slug: '/orders', title: 'Orders', icon: 'Orders', },
    ];

    res.render('extendingLayout', {
        title: 'Practica 1',
        menu: menu
    });
});

//1st step ADD product -> show the form
router.get('/add/', 
    authController.isLoggedIn,
    productController.addProduct
);

//2nd step ADD product -> receive the data
router.post('/add/',
    authController.isLoggedIn,
    productController.verify, //verify type image
    catchErrors(productController.upload), //resize and upload to file system
    catchErrors(productController.createProduct) //save in DB
);

// SHOW a certain product
router.get('/product/:slug', catchErrors(productController.getProductBySlug));

// SHOW all products
router.get('/products', catchErrors(productController.getProducts));

router.get('/products/:id/edit', catchErrors(productController.editProduct));

//2nd step EDIT product -> receive the updated data
router.post('/add/:id',
    productController.verify,
    catchErrors(productController.upload),
    catchErrors(productController.updateProduct)
);

router.get('/api/v1/search', catchErrors(productController.searchProducts));

//1st step SIGN-UP a USER -> show the form
router.get('/register', userController.registerForm);

//2nd step SIGN-UP a USER -> validate, register, login
router.post('/register',
    userController.validationRules(),
    userController.validationCustomRules(),
    userController.validateRegister,
    userController.register,
    authController.login
);

//1st step LOG IN -> show the form
router.get('/login', authController.loginForm); 

//2nd step LOG IN -> do the login
router.post('/login', authController.login);

//LOG OUT
router.get('/logout', authController.logout);

// SHOW ACCOUNT
router.get('/account',
    authController.isLoggedIn,
    userController.account
);

// EDIT ACCOUNT
router.post('/account',
    authController.isLoggedIn,
    catchErrors(userController.updateAccount)
);

//RECEIVE FORGOT ACCOUNT ACTION
router.post('/account/forgot', catchErrors(authController.forgot));

//1st step RESET PASSWD -> show the form
router.get('/account/reset/:token', catchErrors(authController.reset));

//2nd step RESET PASSWD -> change passwd
router.post('/account/reset/:token',
    authController.confirmedPasswords,
    catchErrors(authController.updatePassword)
);

// SHOW all Products
router.get('/products', catchErrors(productController.getProducts));
// SHOW all Products with PAGINATION
router.get('/products/page/:page', catchErrors(productController.getProducts));

//Add to shopping cart
router.post('/add_to_cart',  
    authController.isLoggedIn,
    shoppingCartController.createShoppingCart
);

//Get shopping cart
router.get('/shoppingCart',  
    authController.isLoggedIn, 
    shoppingCartController.getShoppingCart
);

//Remove product from cart
router.post('/remove_from_cart',  
    shoppingCartController.removeProductCart
);

//Paypal integration

//Call Paypal Api
router.post("/api/orders", async (req, res) => {
    const owner = req.user._id;
    const order = await paypal.createOrder(owner);
    res.json(order);
});
  
//Capture Paypal response after payment
router.post("/api/orders/:orderID/capture", async (req, res) => {
    const owner = req.user._id;
    const { orderID } = req.params;
    const captureData = await paypal.capturePayment(orderID, owner);
    res.json(captureData);
});

//Get the orders
router.get('/orders',  
    authController.isLoggedIn,
    orderController.getOrders
);

module.exports = router;