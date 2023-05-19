const sendEmail = require('./sendmail')
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require("multer");
var path = require('path');
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
//app.use("/public", express.static(path.join(__dirname, 'public')));

app.use(cors({
  origin: 'http://localhost:3000'
}));
console.log("===>", __dirname);

let imageLink = "";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname+'/public/uploads/images')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now()
    cb(null, uniqueSuffix+'.'+file.mimetype.split('/')[1])
    imageLink = uniqueSuffix+'.'+file.mimetype.split('/')[1];
  }
})

const upload = multer({ storage: storage })

mongoose.connect("mongodb+srv://zak:19081990ok@cluster0.joytwex.mongodb.net/portfolioDB").then(msg=>{
console.log("Connected successesfully");
}).catch(err=>{
  console.log("=>>>>",err);
});

const skillSchema = {
    title : String,
    content : String,
    link : String,
    icon : String
}
const portfolioSchema = {
  title : String,
  content : String,
  link : String,
  image : String
}

const Skill = mongoose.model("Skill", skillSchema);
const Portfolio = mongoose.model("Portfolio", portfolioSchema);

//SKILL ROUTE

// var corsOptions = {
//   origin: 'http://localhost:3000',
//   optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
// }
app.route("/skill")

.post(function(req, res){
 const skill = {
  title : req.body.title,
  content : req.body.content,
  link : req.body.link,
  icon : req.body.icon
}
console.log(req.body);
const newSkill = new Skill(skill);
newSkill.save();
res.send(skill);
})
.get((req, res)=>{
  Skill.find().then(items =>{
    res.send(items);
  }).catch(err=>{
    res.send(err);
  });
})
//FIND ONE SKILL
app.route("/skill/:id")
.get((req, res)=>{

   const id = req.params.id;

   Skill.findOne({_id : id}).then(item =>{
      res.send(item)
   }).catch(err=>{
      res.send("Skill doesn't Exist !");
   });
})
.delete((req, res)=>{

  const id = req.params.id;

  Skill.deleteOne({_id : id}).then(msg =>{
    console.log("==> DELETED : ",msg);
      if(msg.deletedCount === 1)
      {
        res.send("Deleted successefuly !")
      }else{
        res.send("Can't delete");
      }
    
  }).catch(err=>{
     res.send("delete error");
  });
});

//SEND EMAIL
app.route("/contact")
.post((req, res)=>{

  // const message =  {
  //   fName : req.body.fName,
  //   lName : req.body.lName,
  //   email : req.body.email,
  //   phone : req.body.phone,
  //   object : req.body.object,
  //   message : req.body.message,
  // }
  sendEmail(req.body);
  res.send("MESSAGE RECEIVED ! THANKS")
  
})



//PORTFOLIO ROUTE
app.route("/portfolio")

.post((req, res)=>{
  const portfolio = {
   title : req.body.title,
   content : req.body.content,
   link : req.body.link,
   image : imageLink,
 }
 const newPortfolioItem = new Portfolio(portfolio);
 newPortfolioItem.save();
 res.send(portfolio);
 })
 .get((req, res)=>{
  Portfolio.find().then(items =>{
    res.send(items);
  }).catch(err=>{
    res.send(err);
  });
});

//FIND ON PORTFOLIO

app.route("/portfolio/:id")
.get((req, res)=>{

   const id = req.params.id;

   Portfolio.findOne({_id : id}).then(item =>{
      res.send(item)
   }).catch(err=>{
      res.send("Portfolio doesn't Exist !");
   });
})
.delete((req, res)=>{

  const id = req.params.id;

  Portfolio.deleteOne({_id : id}).then(msg =>{
    console.log("==> DELETED : ",msg);
    if(msg.deletedCount === 1)
    {
      res.send("Deleted successefuly !")
    }else{
      res.send("Can't delete");
    }
  }).catch(err=>{
     res.send("delete error");
  });
});

//UPLOADS ROUTE

app.route("/upload")
.post(upload.single('image'),(req, res)=>{
  res.send("file uploaded !");
  console.log(req.file);

});





app.listen(3001, function() {
  console.log("Server started on port 3001");
});