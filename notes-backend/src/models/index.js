// src/models/index.js
const { Sequelize, DataTypes } = require("sequelize");
const path = require("path");

// Create Sequelize instance connected to SQLite
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "../../database.sqlite"), // database file
  logging: false
});

// Import models
const User = require("./user")(sequelize, DataTypes);
const Note = require("./note")(sequelize, DataTypes);

// Define relationships
User.hasMany(Note, { onDelete: "CASCADE" });
Note.belongsTo(User);

// Sync database
sequelize
  .sync({ alter: true }) // alter will keep schema updated
  .then(() => console.log("✅ Database synced"))
  .catch((err) => console.error("❌ Sync error:", err));

// Export database + models
module.exports = { sequelize, User, Note };
