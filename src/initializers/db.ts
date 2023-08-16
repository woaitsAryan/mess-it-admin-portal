import { configDotenv } from "dotenv";
import mongoose from "mongoose";
configDotenv();

const connectToDB = async (): Promise<void> => {
  await mongoose.connect(process.env.DB_URL);
  return console.log("Connected to Database!");
};

export default connectToDB;
