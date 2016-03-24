"use static";

const sqlite3 = require('sqlite3').verbose();

class Database {

  constructor(file) {
    this.db = new sqlite3.Database(file);
  }

}