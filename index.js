"use strict";

const fs = require('fs');
const util = require('util');
const path = require('path');
const async = require('async');
const readline = require('readline');
const sqlite3 = require('sqlite3').verbose();
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const constants = {
  HOME_DIR: process.env.HOME,
  IS_WIN: /^win/.test(process.platform),
  IS_MAC: /darwin/.test(process.platform),
  IS_LINUX: (!this.IS_WIN || !this.IS_MAC),
  DIR_SEP: this.IS_WIN ? "\\" : "/"
};

let mainDb, db, username,
    mainPath = (constants.IS_WIN) ? path.join(constants.HOME_DIR, "AppData", "Roaming", "Skype") : 
               (constants.IS_MAC) ? path.join(constants.HOME_DIR, "Library", "Application Support", "Skype") :
               /**  IS LINUX  **/   path.join(constants.HOME_DIR, ".Skype");

let base64 = {
  encode: (str) => {
    return new Buffer(str).toString('base64');
  },
  decode: (str) => {
    return new Buffer(str, 'base64').toString('ascii');
  }
};

async.waterfall([

  function (callback) {
    rl.question("Skype username: ", _username => {
      if (!_username || !_username.length) {
        return callback("Must provide a username");
      }

      username = _username;
      return callback(null);
    });
  },

  function (callback) {
    // set path to main.db
    mainDb = path.join(mainPath, username, "main.db");
    console.log(mainDb);

    let query = "SELECT identity, meta_topic FROM Conversations WHERE identity LIKE '19:%@p2p.thread.skype'";

    // create db instance
    db = new sqlite3.Database(mainDb);

    db.serialize(() => {
      // list cloud p2p chats
      db.all(query, (err, rows) => {
        if (err) { return callback(err); }

        rows.forEach(row => {
          let ident = row.identity.split(':')[1].split('@')[0];
          row.ident_decoded = base64.decode(ident);

          console.log(row);
        });
        
        return callback(null);

      });

    });
  }

], function (err) {
  if (err) {
    return console.log(err);
  }
  console.log('done now');
});