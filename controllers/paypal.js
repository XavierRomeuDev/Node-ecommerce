const mongoose = require('mongoose');
const ShoppingCart = mongoose.model('ShoppingCart');
const Product = mongoose.model('Product');
const Order = mongoose.model('Order');
const User = mongoose.model('User');

const CLIENT_ID = 'AWUeC7BsLlxbmh2d3yoG4w-4Mit6VXoy35iIyrsenkrvz0cwB_6oANBX__N3U-3wXDUMLuAj2L6YAjRU';
const APP_SECRET = 'EIXXh2NLGWrUrIUPOnnKSopTkVA79Jp1ZtJG88qjr05_Ry-X37FESycCIHKIEkpoFwgzpNQK3edwWEkC';
const base = "https://api-m.sandbox.paypal.com";

//cuenta sandbox para crear pedidos de prova
//email: sb-xm6g620207819@personal.example.com

// generate an access token using client id and app secret
async function generateAccessToken() {
    const auth = Buffer.from(CLIENT_ID + ":" + APP_SECRET).toString("base64")
    const response = await fetch(`${base}/v1/oauth2/token`, {
      method: "post",
      body: "grant_type=client_credentials",
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });
    const data = await response.json();
    console.log(data);
    return data.access_token;
}

exports.createOrder = async(owner) => {
  
    const shoppingCart = await ShoppingCart.findOne({ owner });
    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders`;
    const response = await fetch(url, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "EUR",
              value: shoppingCart.bill,
            },
          },
        ],
      }),
    });
  const data = await response.json();
  console.log(data);
  return data;
}

// use the orders api to capture payment for an order
exports.capturePayment = async(orderId, owner, req, res) => {
    
    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders/${orderId}/capture`;
    const response = await fetch(url, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await response.json();

    
    const shoppingCart = await ShoppingCart.findOne({ owner });
    const order = await Order.create({
      owner,
      products: shoppingCart.products,
      totalQuantity: shoppingCart.totalQuantity,
      bill: shoppingCart.bill
    });

    const savedOrder = await order.save();
    const deleteCart = await ShoppingCart.findByIdAndDelete({_id: shoppingCart.id})
    return data;
}