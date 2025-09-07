import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class HabitRecord extends Model {}

HabitRecord.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    habit_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "done",
    },
  },
  {
    sequelize,
    modelName: "HabitRecord",
    tableName: "habit_records",
    indexes: [
      {
        unique: true,
        fields: ["habit_id", "date"],
      },
    ],
  }
);

export default HabitRecord;
