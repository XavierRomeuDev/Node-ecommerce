exports.moment = require('moment');
exports.dump = (obj) => JSON.stringify(obj, null, 2);
exports.menu = [
    { slug: '/products', title: 'Productes', },
    { slug: '/add', title: 'Afegir', },
    { slug: '/orders', title: 'Orders', icon: 'Orders', },
];