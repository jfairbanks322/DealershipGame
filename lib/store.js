"use strict";
const { DatabaseSync } = require("node:sqlite");
const fs = require("node:fs");
const path = require("node:path");
function openStore(filename) {
  if (filename !== ":memory:")
    fs.mkdirSync(path.dirname(filename), { recursive: true });
  const db = new DatabaseSync(filename);
  db.exec(
    "PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;",
  );
  db.exec(`CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,username TEXT UNIQUE NOT NULL,name TEXT NOT NULL,hash TEXT NOT NULL,salt TEXT NOT NULL,badges TEXT NOT NULL DEFAULT '[]',featured TEXT NOT NULL DEFAULT '[]');
 CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,userId TEXT NOT NULL REFERENCES users(id),expires INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS games(code TEXT PRIMARY KEY,data TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS careers(game TEXT NOT NULL,userId TEXT NOT NULL REFERENCES users(id),profit INTEGER NOT NULL,win INTEGER NOT NULL,PRIMARY KEY(game,userId));`);
  // Additive migration preserves all existing accounts and games.
  if (
    !db
      .prepare("PRAGMA table_info(users)")
      .all()
      .some((c) => c.name === "avatar")
  )
    db.exec("ALTER TABLE users ADD COLUMN avatar TEXT NOT NULL DEFAULT 'chef'");
  if (
    !db
      .prepare("PRAGMA table_info(sessions)")
      .all()
      .some((c) => c.name === "teacher")
  )
    db.exec(
      "ALTER TABLE sessions ADD COLUMN teacher INTEGER NOT NULL DEFAULT 0",
    );
  if (
    !db
      .prepare("PRAGMA table_info(careers)")
      .all()
      .some((c) => c.name === "lessonId")
  )
    db.exec(
      "ALTER TABLE careers ADD COLUMN lessonId TEXT NOT NULL DEFAULT 'cost-markup-v1'",
    );
  return db;
}
module.exports = { openStore };
