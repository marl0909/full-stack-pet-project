import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import mongoose from "mongoose";
import { registerValidation } from './validations/auth.js'
import { validationResult } from "express-validator";
import UserModel from "./models/User.js";
mongoose.connect('mongodb+srv://admin:XVpVJfht8JtgjeiP@admin.2uob592.mongodb.net/blog?retryWrites=true&w=majority',
    ).then(() => {
        console.log('DB OK')
}).catch( () => {console.log('DB error')});

const app = express();

app.use(express.json())
app.post('/auth/login', async (req, res) => {
  try {
      const user = await UserModel.findOne({ email: req.body.email });

      if(!user) {
          return res.status(404).json({
              message: 'User is not found!'
          });
      }

      const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash);

      if(!isValidPass) {
          return res.status(400).json({
              message: 'Password is wrong!'
          });
      }

      const {passwordHash, ...userData} = user._doc;

      const token = jwt.sign({
              _id: user._id,
          }, 'secret',
          {
              expiresIn: '30d',
          });

      res.json({
          ...userData,
          token,
      });
  } catch (err) {
      console.log(err);
      res.status(500).json({
          message: 'Не вдалось авторизуватись'
      });
  }
})
app.post('/auth/register', registerValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(errors.array());
        }

        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const doc = new UserModel({
            email: req.body.email,
            fullName: req.body.fullName,
            avatarUrl: req.body.avatarUrl,
            passwordHash: hash,
        });

        const user = await doc.save();

        const {passwordHash, ...userData} = user._doc;

        const token = jwt.sign({
            _id: user._id,
        }, 'secret',
            {
                expiresIn: '30d',
            });

        res.json({
            ...userData,
            token,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не вдалось зареєструватись'
        });
    }
});

app.get('/auth/me', async (req, res) => {
    try {
        
    } catch (err) {

    }
})
app.listen(4444, (err) => {
    if(err) {
        return console.log(err);
    }
    return console.log('Server OK')
});