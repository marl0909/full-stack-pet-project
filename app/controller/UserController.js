import {validationResult} from "express-validator";
import bcrypt from "bcrypt";
import UserModel from "../models/User.js";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
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
}

export const login = async (req, res) => {
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
}

export const getMe = async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId)
        if(!user) {
            return res.status(404).json({
                message: "Немає такого користувача",
            })
        }
        const {passwordHash, ...userData} = user._doc;

        res.json({
            ...userData,
        });

    } catch (err) {
        return res.status(404).json({
            message: "Помилка",
        })
    }
}