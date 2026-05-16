import User from '../models/user.models.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
export const registerUser = async (email, password) => {
  const newUser = new User({
    email,
    password,
  });
  await newUser.save();
  return newUser;
};

export const loginUser = async (email, password) => {
  const userExist = await User.findOne({ email });

  if (!userExist) {
    const error = new Error('credenciales invalidas');
    error.statusCode = 401;
    throw error;
  }
  const isMatch = await bcrypt.compare(password, userExist.password);
  
  if(userExist.lockUntil && user.lockUntil > Date.now()){
    const error=new Error("La cuenta sigue bloqueada");
    error.statusCode=400;
    throw error;
  }
  
  if (!isMatch) {
    userExist.lockUntil += 1;
    const error = new Error('credenciales inválidas');
    error.statusCode = 401;
    throw error;
  }
  if(userExist.lockUntil >= 3){
    userExist.lockUntil=Date.now() + 15 *60 * 1000;
  }
  const playload = { id: userExist._id, user: userExist.email };
  const accessToken = jwt.sign(playload, process.env.JWT_TOKEN, {
    expiresIn: '15m',
  });
  const refreshToken = jwt.sign(playload, process.env.REFRESHTOKEN, {
    expiresIn: '7d',
  });
  userExist.refreshToken = refreshToken;
  userExist.loginAttempts=0;
  userExist.lockUntil=null;
  await userExist.save();
  return {
    id: userExist._id,
    email: userExist.email,
    token: accessToken,
    refreshToken,
  };
};

export const refreshToken = async (token) => {
  if (!token) {
    const error = new Error('no sutorizado');
    error.statusCode = 401;
    throw error;
  }
  const decoded = jwt.verify(token, process.env.REFRESHTOKEN);
  const user = await User.findById(decoded.id);
  if (!user || token !== user.refreshToken) {
    const error = new Error('El token es invalido');
    error.statusCode = 401;
    throw error;
  }
  const newToken = jwt.sign(
    {
      id: user._id,
      email: user.email,
    },
    process.env.JWT_TOKEN,
    {
      expiresIn: '15m',
    },
  );
  const newRefreshToken = jwt.sign(
    {
      id: user._id,
      email: user.email,
    },
    process.env.REFRESHTOKEN,
    { expiresIn: '7d' },
  );
  user.refreshToken = newRefreshToken;
  user.save();
  return { accessToken: newToken, refreshToken: newRefreshToken };
};

export const logoutUser = async (token) => {
  if (!token) {
    const user = await User.findOne({ refreshToken: token });
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
  }
};
