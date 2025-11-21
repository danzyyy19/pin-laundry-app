const bcrypt = require('bcryptjs');

const password = 'admin123'; // Ganti dengan password yang diinginkan
const hashed = bcrypt.hashSync(password, 10);
console.log('Hashed password:', hashed);