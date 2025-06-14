const {Router} =require("express");
const multer=require("multer");
const path=require('path');
const fs=require("fs");
const Blog = require("../models/blog");

const router=Router();

const storage=multer.diskStorage({
    destination:function(req,file,cb){
        if (!req.user) {
        return cb(new Error('User not authenticated'));
        }
        const uploadPath=path.resolve(__dirname,`../public/uploads/${req.user._id}`);
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null,uploadPath);
    },
    filename:function(req,file,cb){
        const fileName=`${Date.now()}-${file.originalname}`;
        cb(null,fileName);
    }
})

const upload=multer({storage:storage});

router.get("/add-new",(req,res)=>{
    return res.render('addblog',{
        user:req.user,
    })
})

router.get("/:id",async (req,res)=>{
    const blog=await Blog.findById(req.params.id).populate("createdBy");
    return res.render("blog",{
        user:req.user,
        blog,
    })
})

router.post("/",upload.single('coverImage'),async (req,res)=>{
    const {title,body}=req.body;
    const blog=await Blog.create({
        body,
        title,
        createdBy:req.user._id,
        coverImageURL: `/uploads/${req.user._id}/${req.file.filename}`,
    })
    return res.redirect(`/blog/${blog._id}`);
})

module.exports=router;