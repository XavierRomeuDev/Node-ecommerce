//Connexio a la base de dades MongoDB amb moongose
require('dotenv').config({ path: 'variables.env' });
const mongoose = require('mongoose');
require('./models/User');
require('./models/Product');
require('./models/ShoppingCart');
require('./models/Order');

// Connect to our Database and handle any bad connections
mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=>{
    console.log(`connection to database established`)
}).catch(err=>{
    console.log(`db error ${err.message}`);
    process.exit(-1);
})

// Iniciem la nostra aplicació¡
const app = require('./app');
app.set('port', process.env.PORT || 7777);
const server = app.listen(app.get('port'), () =>{
    console.log(`Aplicacio iniciada al PORT ${server.address().port} **`);
});