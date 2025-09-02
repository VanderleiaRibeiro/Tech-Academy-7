import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class Habit extends Model {
  public id!: number;
  public name!: string;
  public description!: string | null;
  public user_id!: number;
}

Habit.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING(120), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  },
  { sequelize, tableName: "habits", timestamps: true }
);

export default Habit;
