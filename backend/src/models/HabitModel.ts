import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import User from "./UserModel";

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
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: "users", key: "id" }, // 🔑 FK
      onDelete: "CASCADE",
    },
  },
  { sequelize, tableName: "habits", timestamps: true }
);

User.hasMany(Habit, { foreignKey: "user_id", onDelete: "CASCADE" });
Habit.belongsTo(User, { foreignKey: "user_id" });

export default Habit;
