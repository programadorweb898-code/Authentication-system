import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Coneccion a la base de datos corrects');
  } catch (err) {
    console.error('Error en la coneccion a la base de datos', err.message);
    process.exit(1);
  }
};
