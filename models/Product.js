const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const mongodbErrorHandler = require('mongoose-mongodb-errors');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true, // this normalizes names
        required: 'Please enter a product name!' //"name" is mandatory
    },
    slug : String, //this element will be autogenerated
    description: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        trim: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User', // tell MongoDB the relation with model "User"
        required: 'You must supply an author'
    },
    photo: String
},{
    toJson:{virtuals:true},
    toObject: {virtuals:true}
});

// ********PRE-SAVE HOOK********* -
productSchema.pre('save', async function(next) {
    if (!this.isModified('name')) {
        next();
        return; //stop this function from running
    }

    this.slug = slug(this.name);
   
    const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
    const productsWithSlug = await this.constructor.find({ slug: slugRegEx});
    
    if (productsWithSlug.length) { //if slug exists -> increment
        this.slug = `${this.slug}-${productsWithSlug.length+1}`;
    }
    
    next(); //follow the PIPELINE -> do the SAVE
});

// *********INDEXES**********
productSchema.index({
    name: 'text', //we will search in the name attribute
    description: 'text' //we will search in the desc. attribute
});

productSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('Product', productSchema);