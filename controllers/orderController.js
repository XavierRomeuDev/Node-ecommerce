const mongoose = require('mongoose');
const Order = mongoose.model('Order');

exports.getOrders = async (req, res) => {
    
    const owner = req.user._id;
    
    try {
        const orders = await Order.find({ owner: owner }).sort({ createdAt: 'desc'});
        if(orders) {
            res.render('orders', {title: 'Orders', orders: orders});
        } else{
            req.flash('error', `You don't have any order`);
        }
    } catch (error) {
        res.status(500).send()
    }
};