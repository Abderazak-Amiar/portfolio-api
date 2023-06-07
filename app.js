const _ = require('lodash');
const sendEmail = require("./sendmail")
const utils = require("./utils/utils")
const express = require("express")
const bodyParser = require("body-parser")
const ejs = require("ejs")
const cors = require("cors")
const mongoose = require("mongoose")
const multer = require("multer")
const { log } = require("console")
const sharp = require("sharp")
const fs = require("fs")
const jwt = require("jsonwebtoken")
const app = express()
app.use(express.json())
require("dotenv").config({ path: __dirname + "/.env" })

app.set("view engine", "ejs")

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

app.use(express.static("public"))

app.use(
  cors({
    origin: [
      "https://abderazakamiar.com",
      "https://www.abderazakamiar.com",
      "http://localhost:3000",
    ],
  })
)

var imageLink = ""
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + "/public/uploads/temp_images")
  },
  filename: function (req, file, cb) {
    log("FILE")

    log(file)

    const uniqueSuffix =
      Date.now() +
      "" +
      Math.floor(Math.random() * 1000) +
      "_" +
      file.originalname.toLowerCase()
    cb(null, uniqueSuffix)

    imageLink = uniqueSuffix
  },
})

const upload = multer({ storage: storage })

mongoose
  .connect(
    "mongodb+srv://zak:19081990ok@cluster0.joytwex.mongodb.net/portfolioDB"
  )
  .then((msg) => {
    log("Connected successesfully")
    log(process.env.NODE_ENV)
  })
  .catch((err) => {
    log("=>>>>", err)
  })

const skillSchema = {
  title: String,
  content: String,
  link: String,
  icon: String,
}

const portfolioSchema = {
  title: String,
  content: String,
  link: String,
  image: String,
}

const userSchema = {
  user: String,
  password: String,
}

const Skill = mongoose.model("Skill", skillSchema)
const Portfolio = mongoose.model("Portfolio", portfolioSchema)
const User = mongoose.model("User", userSchema)

app
  .route("/skill")

  .post(authenticateToken, function (req, res) {
    const skill = {
      title: req.body.title,
      content: req.body.content,
      link: req.body.link,
      icon: req.body.icon,
    }

    const newSkill = new Skill(skill)

    newSkill.save()

    res.send(skill)
  })
  .get((req, res) => {
    Skill.find()
      .then((items) => {
        res.send(items)
      })
      .catch((err) => {
        res.send(err)
      })
  })

//FIND ONE SKILL

app
  .route("/skill/:id")

  .get((req, res) => {
    const id = req.params.id

    Skill.findOne({ _id: id })
      .then((item) => {
        res.send(item)
      })
      .catch((err) => {
        res.send("Skill doesn't Exist !")
      })
  })
  .delete(authenticateToken, (req, res) => {
    const id = req.params.id

    Skill.deleteOne({ _id: id })
      .then((msg) => {
        if (msg.deletedCount === 1) {
          res.send("Deleted successefuly !")
        } else {
          res.send("Can't delete")
        }
      })
      .catch((err) => {
        res.send("delete error")
      })
  })
  .patch(authenticateToken, (req, res) => {
    const id = req.params.id

    const update = req.body

    Skill.findByIdAndUpdate({ _id: id }, update)
      .then((response) => {

        res.send("UPDATED SUCCESSFULY ! THANKS")

        log(response)
      })
      .catch((err) => {
        log(err)
      })
  })

//SEND EMAIL

app
  .route("/contact")

  .post((req, res) => {
    sendEmail(req.body)
    log("=====================")
    log(req.body)

    res.send("MESSAGE RECEIVED ! THANKS")
  })

//PORTFOLIO ROUTE

app
  .route("/portfolio")

  .post(authenticateToken, (req, res) => {
    const portfolio = {
      title: req.body.title,
      content: req.body.content,
      link: req.body.link,
      image: imageLink,
    }

    const newPortfolioItem = new Portfolio(portfolio)

    newPortfolioItem.save()

    res.send(portfolio)
  })

  .get((req, res) => {
    Portfolio.find()
      .then((items) => {
        res.send(items)
      })
      .catch((err) => {
        res.send(err)
      })
  })

//FIND ON PORTFOLIO

app
  .route("/portfolio/:id")

  .get((req, res) => {
    const id = req.params.id

    Portfolio.findOne({ _id: id })
      .then((item) => {
        res.send(item)
      })
      .catch((err) => {
        res.send("Portfolio doesn't Exist !")
      })
  })

  .delete(authenticateToken, (req, res) => {
    const id = req.params.id

    Portfolio.deleteOne({ _id: id })
      .then((msg) => {
        if (msg.deletedCount === 1) {
          res.send("Deleted successefuly !")
        } else {
          res.send("Can't delete")
        }
      })
      .catch((err) => {
        res.send("delete error")
      })
  })

  .patch(authenticateToken, (req, res) => {
    const id = req.params.id

    var update = {
      title: req.body.title,

      content: req.body.content,

      link: req.body.link,
    }

    Portfolio.findByIdAndUpdate({ _id: id }, update, { new: true })
      .then((response) => {
        res.send("UPDATED SUCCESSFULY ! THANKS")
      })
      .catch((err) => {
        log(err)
      })
  })

//UPLOADS ROUTE

app.route("/upload")

  .post(upload.single("image"),authenticateToken , (req, res) => {
    const imagePath = __dirname + "/public/uploads/images/" + imageLink
    const imageToDelete = __dirname + "/public/uploads/temp_images/" + imageLink

    log("imagePath : ")
    log(imagePath)
    log("req.file.path : ")
    // log()
    //IF req.BODY EXIST
    if (utils.isRealValue(JSON.stringify(req.body))) {
      // IF AN IMAGE IS UPLOADED
       if(req.file){
      console.log("====>>", req.body);

      Portfolio.findByIdAndUpdate(
        { _id: req.body.id_profile },
        { image: imageLink },
        { new: true }
      )
        .then((response) => {
          log(response)

          sharp(req.file.path)
            .resize(640, 480)
            .jpeg({
              quality: 80,
              cromaSubsampling: "4:4:4",
            })
            .toFile(imagePath, (err, info) => {
              if (err) {
                log(err)
              } else {
                fs.unlink(imageToDelete, (err, info) => {
                  if (err) {
                    log(err)
                  } else {
                    log(info)
                  }
                })
              }
            })
        })
        .catch((err) => {
          log(err)
        })
      log("UPDATED UPLOAD IMAGE LINK")
    }
    } else {
      console.log("==>>", req.body);
      sharp(req.file.path)
        .resize(640, 480)
        .jpeg({
          quality: 80,
          cromaSubsampling: "4:4:4",
        })
        .toFile(imagePath, (err, info) => {
          if (err) {
            log(err)
          } else {
            fs.unlink(imageToDelete, (err, info) => {
              if (err) {
                log(err)
              } else {
                log(info)
              }
            })
          }
        })

      log("UPLOAD IMAGE")
    }

    log(req.body)
    res.send("file uploaded !")
  })

app.route("/login").post((req, res) => {
  const user = { user: req.body.user, password: req.body.password }

  User.exists(user)
    .then((response) => {
      if (response) {
        const accessToken = jwt.sign(user, process.env.JWT_ACCESS_TOKEN_SECRET)
        res.json({ accessToken: accessToken })
      } else {
        res.send("NOT EXIST")
      }
    })
    .catch((err) => {
      console.log(err)
    })
})

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"]
  const token = authHeader.split(" ")[1]
  if (token === null) return res.sendStatus(401)
  jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

if (process.env.NODE_ENV === "prod") {
  app.listen(5000, function () {
    log("Server started on port 5000")
  })
} else if (process.env.NODE_ENV === "dev") {
  app.listen(3001, function () {
    log("Server started on port 3001")
  })
}
