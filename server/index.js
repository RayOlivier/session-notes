const express = require("express"),
  app = express(),
  port = 3001,
  { json } = require("body-parser")

const session = require("express-session")
const path = require("path")
//axios = require("axios")

const logger = (req, res, next) => {
  //our own callback
  console.log("req.body: ", req.body)
  console.log("req.session: ", req.session)
  next()
}

// const isAuthed = (req, res, next) => {
//   if (!req.body.admin) {
//     res.status(401).send("Nah")
//   } else {
//     next()
//   }
// }

//NOTES ON PRODUCTION
// app.use(express.static(__dirname + "/../build")) //the path is relative to your server path

//__dirname is the direct file path no matter what system you're in

//top level middlewares are used on EVERY request
app.use(json())
app.use(
  session({
    //takes in a config option
    secret: "thisshouldgoindotenv", //this will normally be stored in .env so it's not pushed to github
    resave: false, //this has to do with what data is stored
    saveUninitialized: false, //if this was true, there would be a session for everyone even if they aren't using it
    cookie: {
      maxAge: 2 * 7 * 24 * 60 * 60 * 1000 //how long the session is saved... this is 2 weeks in milliseconds
    }
  })
)
app.use(logger) //NOT invoked... express will invoke it in its runtime
app.use((req, res, next) => {
  //now it will check for or make a cart with every request
  if (!req.session.cart) {
    req.session.cart = []
  }
  next()
})

// app.use((req, res, next) => {
//   //this top level middleware makes your server read-only

//   if (req.method === "GET") {
//     next()
//   } else {
//     res.sendStatus(405)
//   }
// })

app.get("/api/test", (req, res, next) => {
  console.log("working")
  res.sendStatus(200)
})

app.get("/api/cart", (req, res) => {
  res.status(200).send(req.session.cart) //now a cart is created in the top level middleware above
})

app.post("/api/cart", (req, res) => {
  req.session.cart.push(req.body)
  res.status(200).json(req.session.cart)
})

app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    //this is how you manually dump a session
    res.redirect("/") //then you send them back to the homepage
  })
})

app.post(
  "/api/post",
  logger,
  /*isAuthed,*/ (req, res, next) => {
    //now logger is a request level middleware... it will still get stuck without next() when it's declared
    console.log("posting")
    res.sendStatus(200)
  }
)

//ONLY FOR PRODUCTION
// app.get("*", (req, res) => {
//   //this is a wildcard request that sends the index.html on default... i think
//   res.sendFile(path.join(__dirname, "../build/index.html"))
// })

app.listen(port, () => console.log(`App listening on #${port}`))
