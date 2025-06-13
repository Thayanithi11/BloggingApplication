const express=require("express");
require('dotenv').config();
const mongoose=require("mongoose");
const path=require("path");
const userRoute=require("./routes/user");
const cookieparser=require("cookie-parser");
const { checkForAuthenticationCookie } = require("./middlewares/authentication");

const app=express();
const PORT=process.env.PORT
app.set("view engine","ejs");
app.set("views",path.resolve("./views"));

mongoose.connect('mongodb://localhost:27017/blogify')
.then((e)=>{
    console.log("MongoDB connected");
})
.catch((err)=>{
    console.log("THere was an error connecting to the database");
})

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieparser())
app.use(checkForAuthenticationCookie('token'))

app.use("/user",userRoute);

app.get('/',(req,res)=>{
    return res.render("home",{
        user:req.user,
    });
});

app.listen(PORT,()=>{
    console.log("Listening to PORT Number:",PORT);
})