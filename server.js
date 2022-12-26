const express = require("express");
const flash = require("express-flash"); //flash requires session
const session = require("express-session");
const { db } = require("./database/db_config.js");
const { createHash } = require('crypto');

const app = express();

const PORT = 8000;

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: false })); // cannot use req.body without this line
app.use(session({secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false}));
app.use(flash());

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.get("/login", (req, res) => {
    res.render("login.ejs");
});

app.get("/register", (req, res) => {
    res.render("register.ejs");
});

app.get("/dashboard", (req, res) => {
    res.render("dashboard.ejs");
});

app.post("/login", async (req, res) => {
    let {username, password} = req.body;
    let errors = [];
    await db.any('SELECT username, password_hash FROM account WHERE username=$1;', [username])
        .then(data => {
            console.log(data);
            if (data.length === 1 && hash(password) === data[0].password_hash) {
                res.redirect("/dashboard");
            }
            else {
                errors.push({message: "Incorrect username or password"});
                res.render("login.ejs", {errors});
            }
        })
        .catch(error => {
            console.log(error);
        });
});

app.post("/register", async (req, res) => {
    const {username, password, password2, firstname, surname, gender, birthday, email, phone_number} = req.body;
    const errors = [];
    if (password.length < 6) {
        errors.push({ message: "Password must be a least 6 characters long" });
    }
    if (!username || !password || !password2 || !firstname || !surname || !gender || !birthday || !email || !phone_number) {
        errors.push({ message: "Please fill out all fields" });
    }
    if (password !== password2) {
        errors.push({ message: "Passwords do not match" });
    }
    if (errors.length > 0) {
        res.render("register.ejs", {errors});
    }
    await db.any(`SELECT * FROM account WHERE username = $1`, [username])
        .then(data => {
            if (data.length > 0) {
                errors.push({message: "Username already registered"});
                res.render("register.ejs", {errors});
            }
            let personal_information_id;
            let people_id;
            db.any(
                `INSERT INTO personal_information (firstname, surname, gender, birthday, email, phone_number) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, firstname, surname, gender, birthday, email, phone_number`,
                [firstname, surname, gender, birthday, email, phone_number])
                .then(data => {
                    console.log(data);
                    personal_information_id = data[0].id;
                    return db.any(
                        `INSERT INTO people (personal_info, current_position) VALUES ($1, $2) RETURNING id, personal_info, current_position`,
                        [personal_information_id, 'staff'])
                })
                .then(data => {
                    console.log(data);
                    people_id = data[0].id;
                    return db.any(
                        `INSERT INTO account (username, password_hash, account_owner) VALUES ($1, $2, $3) RETURNING username, password_hash, account_owner`,
                        [username, hash(password), people_id])
                })
                .then(data => {
                    console.log(data);
                    req.flash("success_msg", "You are now registered, please log in");
                    res.redirect("/login");
                })
                .catch(error => {
                    console.log(error);
                });
        })
        .catch(error => {
            console.log(error);
        });
});

app.listen(PORT, (err) => {
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
});

function hash(string) {
    return createHash('sha256').update(string).digest('hex');
}