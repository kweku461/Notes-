// models/note.js
module.exports = (sequelize, DataTypes) => {
  const Note = sequelize.define("Note", {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Untitled Page",
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  return Note;
};
