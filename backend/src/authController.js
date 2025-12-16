const bcrypt = require("bcrypt");
const db = require("./db.js");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const salt = 10;

// 1. LOGIN CONTROLLER
const loginuser = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err)
      return res.status(500).json({ success: false, message: "Server Error" });
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    req.login(user, (err) => {
      if (err)
        return res
          .status(500)
          .json({ success: false, message: "Login failed" });

      return res.status(200).json({
        success: true,
        message: "Login success",
        user: {
          id: user.id,
          username: user.username,
          mobilenumber: user.mobilenumber,
        },
      });
    });
  })(req, res, next);
};

// 2. REGISTER CONTROLLER
const registeruser = async (req, res) => {
  const { username, password, mobilenumber } = req.body;

  try {
    const existing = await db.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: "User exists" });
    }

    const hash = await bcrypt.hash(password, salt);
    const result = await db.query(
      "INSERT INTO users (username, password, mobilenumber) VALUES ($1, $2, $3) RETURNING *",
      [username, hash, mobilenumber]
    );

    const user = result.rows[0];
    return res.status(201).json({
      success: true,
      message: "User registered",
      user: {
        id: user.id,
        username: user.username,
        mobilenumber: user.mobilenumber,
      },
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Error creating user" });
  }
};

// 3. PASSPORT STRATEGY
passport.use(
  new LocalStrategy(async (username, password, cb) => {
    try {
      const result = await db.query("SELECT * FROM users WHERE username = $1", [
        username,
      ]);
      if (result.rows.length === 0) return cb(null, false);

      const user = result.rows[0];
      bcrypt.compare(password, user.password, (err, isValid) => {
        if (err) return cb(err);
        if (isValid) return cb(null, user);
        return cb(null, false);
      });
    } catch (err) {
      return cb(err);
    }
  })
);

// 4. SESSION HANDLING (Optimized)
passport.serializeUser((user, cb) => {
  cb(null, user.id); // Save only ID to session
});

passport.deserializeUser(async (id, cb) => {
  try {
    const result = await db.query(
      "SELECT id, username, mobilenumber FROM users WHERE id = $1",
      [id]
    );
    cb(null, result.rows[0]);
  } catch (err) {
    cb(err);
  }
});

module.exports = { loginuser, registeruser };
