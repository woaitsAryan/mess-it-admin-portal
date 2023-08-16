import mongoose, { Schema } from "mongoose";
import { Result } from "../types/result";

export interface MenuType extends Document {
  _id: Schema.Types.ObjectId;
  hostel: Number;
  month: Number;
  year: Number;
  menus: {
    nonVegMenu: Result;
    vegMenu: Result;
    specialMenu: Result;
  };
}

const menuSchema = new Schema({
  hostel: {
    type: Number,
    required: true,
  },
  month: {
    type: Number,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  menus: {
    type: Object,
    required: true,
  },
});

const Menu = mongoose.model<MenuType>("Menu", menuSchema);
export default Menu;
