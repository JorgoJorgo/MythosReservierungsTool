const bcrypt = require('bcrypt');

const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log(`Hashed password: ${hashedPassword}`);
  } catch (err) {
    console.error(err);
  }
};

// Ersetze 'your_password' durch das tatsächliche Passwort, das du hashen möchtest
hashPassword('your_password');
