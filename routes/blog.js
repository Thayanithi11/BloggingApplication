const {Router} =require("express");
const multer=require("multer");
const path=require('path');
const fs=require("fs");
const Blog = require("../models/blog");
const Comment = require("../models/comments");


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

router.get("/view-blogs", async (req, res) => {
  if (!req.user) return res.redirect("/user/signin");
  const allBlogsByuser = await Blog.find({ createdBy: req.user._id })
    .sort("-createdAt")
    .populate("createdBy");
  return res.render("userblogs", {
    user: req.user,
    blogs: allBlogsByuser,
  });
});

router.get("/edit/:id",async (req,res)=>{
    const blog=await Blog.findById(req.params.id);
    return res.render('edit', { blog, user: req.user });
})

router.get("/delete/:id",async (req,res)=>{
    const blog=await Blog.findById(req.params.id);
    await Blog.deleteOne({_id:blog._id});
    res.redirect("/blog/view-blogs");
})

router.get("/:id",async (req,res)=>{
    const blog=await Blog.findById(req.params.id).populate("createdBy");
    const comments=await Comment.find({blogId:req.params.id}).populate('createdBy')
    return res.render("blog",{
        user:req.user,
        blog,
        comments,
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
    return res.redirect("/blog/view-blogs");
})

router.post("/edit/:id", upload.single('coverImage'), async (req, res) => {
  try {
    const { title, body, oldCoverImageURL } = req.body;

    let coverImageURL = oldCoverImageURL;

    if (req.file) {
      // new file uploaded
      coverImageURL = `/uploads/${req.user._id}/${req.file.filename}`;

      // Optionally delete old file if you want (fs.unlink)
      // Be careful with file deletion!
    }

    await Blog.findByIdAndUpdate(req.params.id, {
      title,
      body,
      coverImageURL,
    });
   return res.redirect("/blog/view-blogs");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error updating blog");
  }
});

router.post('/comment/:blogId',async (req,res)=>{
  const comment=await Comment.create({
    content:req.body.content,
    blogId:req.params.blogId,
    createdBy:req.user._id,
  });
  return res.redirect(`/blog/${req.params.blogId}`);
})

module.exports=router;