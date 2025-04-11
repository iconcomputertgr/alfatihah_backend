const bcrypt = require("bcrypt");
bcrypt.hash("123", 10, (err, hash) => {
  if (err) console.error(err);
  else console.log("Hash for '123':", hash);
});
