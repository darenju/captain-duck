const fs = require('fs');
const DATABASE_FILE = './players.json';

function read() {
  return JSON.parse(fs.readFileSync(DATABASE_FILE));
}

function write(database) {
  fs.writeFileSync(DATABASE_FILE, JSON.stringify(database));
}

module.exports = {
  read,
  write,
};
