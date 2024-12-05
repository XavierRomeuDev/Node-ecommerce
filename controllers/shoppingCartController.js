const mongoose = require('mongoose');
const Product = mongoose.model('Product');
const ShoppingCart = mongoose.model('ShoppingCart');

exports.createShoppingCart = async (req, res) => {

    const owner = req.user._id;
    const { productId, quantity } = req.body;

    try{
        
        const product = await Product.findOne({ _id: productId });
        const shoppingCart = await ShoppingCart.findOne({ owner });

        if (!product) {
            res.status(404).send({ message: "product not found" });
            return;
        }

        const price = product.price;
        const name = product.name;

        if (shoppingCart) {

            const productIndex = shoppingCart.products.findIndex((product) => product.productId == productId);
            //check if product exists or not

            if (productIndex > -1) {
                let product = shoppingCart.products[productIndex];
                product.quantity += 1;
                
                shoppingCart.totalQuantity = shoppingCart.totalQuantity + 1;
                shoppingCart.bill = shoppingCart.products.reduce((acc, curr) => {
                    return acc + curr.quantity * curr.price;
                },0)

                shoppingCart.products[productIndex] = product;
                await shoppingCart.save();
                req.flash('success', `Successfully added to cart.` + product.name);
                res.redirect(`/products`);
            } else {
                shoppingCart.products.push({ productId, name, quantity, price });
                shoppingCart.bill = shoppingCart.products.reduce((acc, curr) => {
                    return acc + curr.quantity * curr.price;
                },0)
                shoppingCart.totalQuantity = shoppingCart.totalQuantity + 1;
                await shoppingCart.save();
                req.flash('success', `Successfully added to cart: ` + product.name);
                res.redirect(`/products`);
            }
        } else {
            //no shopping cart exists, create one
            const newCart = new ShoppingCart({
              owner,
              products: [{ productId, name, quantity, price }],
              bill: 1 * price,
              totalQuantity: 1,
            });
            await newCart.save();
            req.flash('success', `Successfully to cart.` + product.name);
            res.redirect(`/products`);
          }
    }  catch (error){
        //debug errors
        console.log(error);
        req.flash('error', `Something goes wrong.`);
        res.redirect(`/products`);
    }
};

exports.getShoppingCart = async (req, res) => {
    
    const owner = req.user._id;

    try{
        const shoppingCarts = await ShoppingCart.findOne({ owner });
        if(shoppingCarts && shoppingCarts.products.length > 0){
            res.render('shoppingCart', {title: 'Shopping Cart', shoppingCarts: shoppingCarts});
        } else{
            req.flash('error', `You don't have a shopping cart`);
        }
    } catch (error){
        res.status(500).send();
    }
};

exports.removeProductCart = async (req, res) => {

    const owner = req.user._id;
    const productId = req.body.productId;
    
    try {
       let shoppingCart = await ShoppingCart.findOne({ owner });
   
       const productIndex = shoppingCart.products.findIndex((product) => product.productId == productId);
       
       if (productIndex > -1) {
        let product = shoppingCart.products[productIndex];
        shoppingCart.bill -= product.quantity * product.price;
        
        if(shoppingCart.bill < 0) {
            shoppingCart.bill = 0;
        }

        shoppingCart.products.splice(productIndex, 1);
        shoppingCart.bill = shoppingCart.products.reduce((acc, curr) => {
            return acc + curr.quantity * curr.price;
        },0)

        shoppingCart.totalQuantity -= product.quantity;
        shoppingCart = await shoppingCart.save();
        if(shoppingCart.totalQuantity < 1){
            res.redirect(`/products`);
        } else{
            res.redirect(`/shoppingCart`);
        }        
        } else {
            res.status(404).send("item not found");
        }
        } catch (error) {
            //debug errors
            console.log(error);
            res.status(400).send();
      }
};