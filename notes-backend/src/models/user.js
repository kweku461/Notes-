// src/models/user.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    name: {                     // <-- must exist
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    passwordHash: {             // <-- must match what you use in auth.js
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: "user"
    }
  }, {
    tableName: 'Users',         // <-- optional, ensure it matches your DB
    timestamps: true            // keeps createdAt & updatedAt
  });

  return User;
};
