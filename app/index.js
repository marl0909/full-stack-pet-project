import express from 'express';
import mongoose from "mongoose";
import {registerValidation} from './validations/auth.js'
import checkAuth from "./utils/checkAuth.js";
import {getMe, login, register} from "./controller/UserController.js";

//__Connect DB_________________________________________________
mongoose.connect('mongodb+srv://admin:XVpVJfht8JtgjeiP@admin.2uob592.mongodb.net/blog?retryWrites=true&w=majority',
).then(() => {
    console.log('DB OK')
}).catch(() => {
    console.log('DB error')
});


const app = express();
app.use(express.json())


//__REQUESTS For Authorization____________________________________
app.post('/auth/login', login)

app.post('/auth/register', registerValidation, register);

app.get('/auth/me', checkAuth, getMe)

//__Listen_________________________________
app.listen(4444, (err) => {
    if (err) {
        return console.log(err);
    }
    return console.log('Server OK')
});