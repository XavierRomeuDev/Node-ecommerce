const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises

const ObjectID = mongoose.Schema.Types.ObjectId

const shoppingCartSchema = new mongoose.Schema({
    owner: {
        type: ObjectID,
        ref: 'User',
        required: 'You must supply an owner'
    },
    products: [{
        productId:{
            type: ObjectID, 
            ref: 'Product',
            required: true
        },
        name: String,
        quantity:{
            type: Number,
            required: true,
            min: 1,
            default: 1
        },
        price: Number
        }],
        totalQuantity:{
            type: Number,
            min: 0,
            default: 0
        },
        bill: {
            type: Number,
            required: true,
            default: 0
        }
    }, {
        timestamps: true 
    }
);

module.exports = mongoose.model('ShoppingCart', shoppingCartSchema);