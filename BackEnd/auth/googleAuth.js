import express from "express";
import passport from "passport";
import session from "express-session";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { productDB } from "../models/database.js"; // Update database path

const router = express.Router();

// Configure session middleware
router.use(session({ 
  secret: "your-secret-key", 
  resave: false, 
  saveUninitialized: true,
  cookie: { secure: false } // Ensure secure is false for local development
}));

// Initialize Passport
router.use(passport.initialize());
router.use(passport.session());

// Configure Passport with Google OAuth
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID, // Ensure this is set in .env
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Ensure this is set in .env
      callbackURL: "http://localhost:8081/auth/google/callback", // Ensure this matches Google Cloud Console
    },
    (accessToken, refreshToken, profile, done) => {
      console.log("Google profile:", profile); // Log profile for debugging
      return done(null, profile);
    }
  )
);

// Serialize and deserialize user
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Routes
router.get("/", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  async (req, res) => {
    try {
      const username = req.user.displayName;
      const email = req.user.emails[0].value;

      console.log("Authenticated user:", { username, email }); // Log user info

      // Check if the user already exists in the database
      const checkUserQuery = "SELECT * FROM login WHERE email = ?";
      productDB.query(checkUserQuery, [email], (err, results) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Database error" });
        }

        if (results.length === 0) {
          // If user does not exist, insert into the database
          const insertUserQuery = "INSERT INTO login (username, email) VALUES (?, ?)";
          productDB.query(insertUserQuery, [username, email], (err, result) => {
            if (err) {
              console.error("Failed to insert user:", err);
              return res.status(500).json({ message: "Failed to store user data" });
            }

            // Fetch the newly inserted user
            const newUserQuery = "SELECT * FROM login WHERE email = ?";
            productDB.query(newUserQuery, [email], (err, newUser) => {
              if (err) {
                console.error("Failed to fetch new user:", err);
                return res.status(500).json({ message: "Failed to fetch user data" });
              }

              // Redirect to frontend with user data
              res.redirect(
                `http://localhost:5173/login?username=${newUser[0].username}&email=${newUser[0].email}`
              );
            });
          });
        } else {
          // User already exists, redirect to frontend with user data
          res.redirect(
            `http://localhost:5173/login?username=${results[0].username}&email=${results[0].email}`
          );
        }
      });
    } catch (error) {
      console.error("Error during Google callback:", error);
      res.redirect("http://localhost:5173");
    }
  }
);

router.get("/current-user", (req, res) => {
  if (req.session.user) {
    res.json(req.session.user); // Return user session data
  } else {
    res.status(401).json({ message: "Not logged in" });
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Failed to destroy session:", err);
      return res.status(500).json({ message: "Logout failed" });
    }
    res.clearCookie("connect.sid"); // Clear session cookie
    res.json({ message: "Logged out successfully" });
  });
});

export default router;
