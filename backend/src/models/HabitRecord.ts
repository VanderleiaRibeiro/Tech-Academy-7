import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import Habit from "./HabitModel";

class HabitRecord extends Model {
  public id!: number;
  public habit_id!: number;
  public date!: Date;
  public completed!: boolean;
}

HabitRecord.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    habit_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: "habits", key: "id" }, // 🔑 FK
      onDelete: "CASCADE",
    },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    completed: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  { sequelize, tableName: "habit_records", timestamps: true }
);

Habit.hasMany(HabitRecord, { foreignKey: "habit_id", onDelete: "CASCADE" });
HabitRecord.belongsTo(Habit, { foreignKey: "habit_id" });

export default HabitRecord;
