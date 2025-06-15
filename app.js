const express=require("express");
require('dotenv').config();
const mongoose=require("mongoose");
const path=require("path");
const userRoute=require("./routes/user");
const blogRouter=require("./routes/blog");
const Blog=require("./models/blog");
const cookieparser=require("cookie-parser");
const { checkForAuthenticationCookie } = require("./middlewares/authentication");

const app=express();
const PORT=process.env.PORT || 8000
app.set("view engine","ejs");
app.set("views",path.resolve("./views"));

mongoose.set('bufferCommands', false);
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieparser())
app.use(express.static(path.resolve("./public")))
app.use(checkForAuthenticationCookie('token'))


app.use("/user",userRoute);
app.use("/blog",blogRouter);

app.get('/',async (req,res)=>{
    const allBlogs=await Blog.find({}).sort("-createdAt").populate("createdBy");
    return res.render("home",{
        user:req.user,
        blogs:allBlogs,
    });
});

app.listen(PORT,()=>{
    console.log("Listening to PORT Number:",PORT);
})