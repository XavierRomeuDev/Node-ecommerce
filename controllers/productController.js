const multer = require('multer');
const uuid = require('uuid');
const jimp = require('jimp');
const mongoose = require('mongoose');
const Product = mongoose.model('Product');
const ShoppingCart = mongoose.model('ShoppingCart');

const multerOptions = {
    storage: multer.memoryStorage(),
    fileFilter: function(req, file, next) {
        const isPhoto = file.mimetype.startsWith('image/');
        if (isPhoto) {
            next(null, true); //1st value is provided in case of error.
        } else {
            next({ message: 'That filetype isn\'t allowed'}, false);
        }
    }
};

//MIDLEWARE FUNCTION for CREATE product
exports.verify = multer(multerOptions).single('photo');

exports.addProduct = (req, res) => {
    //same template is used to create and to edit
    res.render('editProduct', { title: 'Afegeix un producte' });
};

//MIDLEWARE FUNCTION for CREATE product
exports.upload = async (req, res, next) => {
    //check if there is no new file to resize
    if (!req.file) {
        next(); // no file -> do nothing and go to next middleware
        return;
    }

    console.log(req.body);
    console.log(req.file);
   
    const extension = req.file.mimetype.split('/')[1];
    req.body.photo = `${uuid.v4()}.${extension}`;
   
    //now we resize and write in hard-drive
    const photo = await jimp.read(req.file.buffer);
    await photo.resize(800, jimp.AUTO); //width=800, height=AUTO
    await photo.write(`./public/uploads/${req.body.photo}`);
   
    //photo saved in file system, keep going with the PIPELINE
    next();
};

exports.createProduct = async (req, res) => {
    //add the id of authenticated user object as author in body
    req.body.author = req.user._id;
    const product = new Product(req.body);
    const savedProduct = await product.save();
    console.log('Product saved!');
    
    req.flash('success', `Successfully Created ${product.name}.`);
    res.redirect(`/product/${savedProduct.slug}`);
};

exports.getProductBySlug = async (req, res, next) => {
    const product = await Product.findOne({ slug: req.params.slug });
    
    // If no product -> DB send a NULL -> do nothing and follow the pipeline
    if (!product) {
        next();
        return;
    }

    res.render('product', { title: `product ${product.name}`, product: product});
};

exports.getProducts = async (req, res) => {

    const page = req.params.page || 1;
    const limit = 3; // items in each page
    const skip = (page * limit) - limit;
    //1. query the DB for a list of all products
    const productsPromise = Product
        .find() //look for ALL
        .skip(skip) //Skip items of former pages
        .limit(limit) //Take the desired number of items
        .sort({ created: 'desc'}); //sort them
    
    const countPromise = Product.count();
    
    //send two promises (2 queries) at the same time
    const [products, count] = await Promise.all([productsPromise, countPromise]);
    
    const pages = Math.ceil(count / limit);
    
    if (!products.length && skip) {
        req.flash('info', `You asked for page ${page}. But that does not exist. So I put you on page ${pages}`);
        res.redirect(`/products/page/${pages}`);
        return;
    }

    if(req.user._id){
        const owner = req.user._id;
        const shoppingCart = await ShoppingCart.findOne({owner});

        if(shoppingCart){
            const totalQuantity = shoppingCart.totalQuantity;
            res.render('products', {title: 'Products', products: products, page: page, pages: pages, count: count, totalQuantity: totalQuantity});
        } else{
            res.render('products', {title: 'Products', products: products, page: page, pages: pages, count: count});
        }
    }
};

exports.editProduct = async (req, res) => {
    const product = await Product.findOne({ _id: req.params.id });
    confirmOwner(product, req.user);
    res.render('editProduct', { title: `Edit ${product.name}`, product: product});
};

exports.updateProduct = async (req, res) => {
    // find and update the product
    const product = await Product.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true, //return new product instead of old one
        runValidators: true
    }).exec();
    
    req.flash('success', `Successfully updated <strong>${product.name}</strong>.
    
    <a href="/product/${product.slug}">View product</a> `);
    
    res.redirect(`/products/${product._id}/edit`);
};

exports.searchProducts = async (req, res) => {
    const products = await Product.find({
        $text: { //1er param: query filter -> conditions
        $search: req.query.q
    }
    }, { //2n param: query projection -> fields to include or exclude from the results
        score: { $meta: 'textScore'}
    }).sort({ //first filter
        score: { $meta: 'textScore'}
    }).limit(5); //second filter
   
    res.json({products, length: products.length});
};

//*** Verify Credentials
const confirmOwner = (product, user) => {
    if (!product.author.equals(user._id)) {
        throw Error('You must own the product in order to edit it');
    }
};