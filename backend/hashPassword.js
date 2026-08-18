// TEMPORARY FILE

import bcrypt from 'bcrypt';

const password = 'admin123';

const hash = await bcrypt.hash(password, 10);

console.log(hash);