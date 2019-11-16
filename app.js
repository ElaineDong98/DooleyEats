const express = require("express"), 
      app = express();

const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use(methodOverride("_method"));
// Passport config
require("./config/passport")(passport);

// DB Config
const db = require("./config/keys").mongoURI;

// Connect to Mongo
mongoose
  .connect(db, { 
    useUnifiedTopology: true, 
    useNewUrlParser: true, 
    useFindAndModify: false})
  .then(() => console.log("MongoDB Connected..."))
  .catch(err => console.log(err));

// EJS
app.use(expressLayouts);
app.set("view engine", "ejs");

// Bodyparser
app.use(express.urlencoded({ extended: false }));

// Express Session
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

//Global Vars for success & error message
//also added currUser
app.use((req, res, next) => {
  res.locals.currUser = req.user;
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

// Routes
app.use("/", require("./routes/index"));
app.use("/users", require("./routes/users"));
app.use("/posts", require("./routes/posts"));
app.use("/posts/:id/comments", require("./routes/comments"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));
