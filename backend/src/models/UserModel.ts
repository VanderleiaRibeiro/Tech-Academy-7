import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import bcrypt from "bcrypt";

class User extends Model {
  public id!: number;
  public name!: string | null;
  public email!: string;
  public password!: string;
  public url_img!: string | null;
  public description!: string | null;

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

   toJSON() {
    const values = { ...this.get() } as any;
    delete values.password; // 👈 remove do retorno
    return values;
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING(120), allowNull: true },
    email: { type: DataTypes.STRING(200), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(200), allowNull: false },
    url_img: { type: DataTypes.STRING(255), allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
  },
  { sequelize, tableName: "users", timestamps: true }
);

User.beforeCreate(async (user) => {
  user.password = await bcrypt.hash(user.password, 10);
});
User.beforeUpdate(async (user) => {
  if (user.changed("password")) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});

export default User;
