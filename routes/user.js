const {Router}=require("express");
const User = require("../models/user");


const router=Router();

router.route("/signin")
.get((req,res)=>{
    return res.render("signin");
})
.post(async (req,res)=>{
    const {email,password}=req.body;
    const user=await User.matchPassword(email,password);

    console.log("User",user);
    return res.redirect("/")
})

router.route("/signup")
.get((req,res)=>{
    return res.render("signup");
})
.post(async (req,res)=>{
    const {fullName,email,password}=req.body;
    await User.create({
        fullName,
        email,
        password,
    })
    return res.redirect("/");
})

module.exports=router;