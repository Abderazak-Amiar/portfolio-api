const sendEmail = require('./sendmail')
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require("multer");
const { log } = require('console');
const sharp = require('sharp');
const fs = require('fs');
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({

  extended: true
  
}));

app.use(express.static("public"));


app.use(cors({

   origin: ['https://abderazakamiar.com','https://www.abderazakamiar.com']
   
}));

var imageLink = "";
const storage = multer.diskStorage({

  destination: function (req, file, cb) {
  
    cb(null, __dirname+'/public/uploads/temp_images')
    
  },
  filename: function (req, file, cb) {    
  
     log("FILE");
     
     log(file);
     
    const uniqueSuffix = Date.now()+""+Math.floor(Math.random()*1000)+"_"+file.originalname.toLowerCase();
    cb(null, uniqueSuffix);
    
     imageLink = uniqueSuffix;
     
  }
  
})

const upload = multer({ storage: storage })

mongoose.connect("mongodb+srv://zak:19081990ok@cluster0.joytwex.mongodb.net/portfolioDB").then(msg=>{

log("Connected successesfully");

}).catch(err=>{

  log("=>>>>",err);
  
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



app.route("/skill")

.post(function(req, res){

 const skill = {
  title : req.body.title,
  content : req.body.content,
  link : req.body.link,
  icon : req.body.icon
}

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
  
      if(msg.deletedCount === 1)
      {
        res.send("Deleted successefuly !")
        
      }else{
      
        res.send("Can't delete");
        
      }
    
  }).catch(err=>{
  
     res.send("delete error");
     
  });
  
})
.patch((req, res)=>{

  const id = req.params.id;
  
  const update = req.body;

  Skill.findByIdAndUpdate({_id : id}, update).then(res=>{
  
    res.send("UPDATED SUCCESSFULY ! THANKS")
    
    log(res);
    
  }).catch(err=>{
  
    log(err);
    
  })
  
})

//SEND EMAIL

app.route("/contact")

.post((req, res)=>{

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
  
    if(msg.deletedCount === 1)
    
    {
      res.send("Deleted successefuly !")
      
    }else{
    
      res.send("Can't delete");
      
    }
    
  }).catch(err=>{
  
     res.send("delete error");
     
  });
  
})

.patch((req, res)=>{

 
  const id = req.params.id;

  var update = {
  
    title : req.body.title,
    
    content : req.body.content,
    
    link : req.body.link,
  }

  Portfolio.findByIdAndUpdate({_id : id}, update, {new :true}).then(response =>{
  
      res.send("UPDATED SUCCESSFULY ! THANKS")
      
       
  }).catch(err=>{
  
  log(err);
  
  });

 
  
})

//UPLOADS ROUTE

app.route("/upload")

.post(upload.single('image'),(req, res)=>{

const imagePath = __dirname+'/public/uploads/images/'+imageLink;
const imageToDelete = __dirname+'/public/uploads/temp_images/'+imageLink;



  log("imagePath : ");
 log(imagePath);
 log("req.file.path : ");
 log(req.file.path);
 
   if(req.body){
   
     Portfolio.findByIdAndUpdate({_id : req.body.id_profile}, {image : imageLink} , {new :true}).then(response =>{
      log(response);
      
      sharp(req.file.path).resize(640,480).jpeg({
      quality : 80,
      cromaSubsampling : '4:4:4'
      
      }).toFile(imagePath, (err, info)=>{
      
        if(err){
        log(err);
        
        }else{
        
          fs.unlink(imageToDelete, (err, info)=>{
  
              if(err){
              log(err);
              }else{
              log(info);
              }
  
                })
        }
      
      });
      

      
       
  }).catch(err=>{
  
  log(err);
  
  });
     log("UPDATED UPLOAD IMAGE LINK")
     
   }else{
         sharp(req.file.path).resize(640,480).jpeg({
      quality : 80,
      cromaSubsampling : '4:4:4'
      
      }).toFile(imagePath, (err, info)=>{
      
        if(err){
        log(err);
        
        }else{
        
        fs.unlink(imageToDelete,(err,info)=>{
        
        if(err){
        
        log(err);
        }else{
        
        log(info);
        }
        
        })
        
        }
      
      });
      

   log("UPLOAD IMAGE")
   }

   log(req.body);
  res.send("file uploaded !");
  

})






app.listen(5000, function() {

  log("Server started on port 5000");
  
});
