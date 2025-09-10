require("dotenv").config()
const mongoose = require("mongoose")
const express = require("express")
const cors = require("cors")
const app = express()
const axios = require("axios")
const { OAuth2Client } = require("google-auth-library")
const querystring = require("querystring")
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URI = process.env.REDIRECT_URI 
const FRONTEND_URL = process.env.FRONTEND_URL 
const PORT = process.env.PORT || 9000
const MONGO_CONNECTION_URL = process.env.MONGO_CONNECTION_URL
const server = require("http").Server(app)
const webpush = require("web-push")
const bodyParser = require("body-parser")
const cron = require("node-cron")
// === Connect to MongoDB Atlas ===
mongoose
  .connect(
    MONGO_CONNECTION_URL,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  )
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((error) => console.error("❌ MongoDB connection error:", error))
  const connection = mongoose.connection
connection.once("open", () => {
  console.log("✅ Database is ready to use...")
})
connection.on("error", (err) => {
  console.error("MongoDB error:", err)
})
// === Middlewares ===
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cors({
  origin: FRONTEND_URL,
  methods: ["GET", "POST","PATCH"],
  credentials: true
}));
app.use(bodyParser.json())

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
  res.removeHeader("Cross-Origin-Embedder-Policy"); // optional, prevents isolation
  next();
});
webpush.setVapidDetails(
  "mailto:sauravsajeev47@gmail.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)
function getAge(dob) {
  const birthDate = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}
function resolveDayKeyword(keyword) {
  const today = new Date()
  let targetDate = new Date(today)

  switch (keyword) {
    case "tomorrow":
      targetDate.setDate(today.getDate() + 1)
      break
    case "next-week":
      targetDate.setDate(today.getDate() + 7)
      break
    case "next-month":
      targetDate.setMonth(today.getMonth() + 1)
      break
    default:
      return null // invalid or no match
  }

  return targetDate.toISOString().split("T")[0] // YYYY-MM-DD
}
function isBirthdayToday(dob) {
  const today = new Date()
  const birthDate = new Date(dob)
  return (
    today.getMonth() === birthDate.getMonth() &&
    today.getDate() === birthDate.getDate()
  )
}
// Save subscription from frontend
app.post("/api/subscribe/:google_id", async (req, res) => {
  try {
    const { google_id } = req.params;
    const subscription = req.body; // frontend should send subscription object

    const user = await User.findOne({ google_id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent duplicates
    const alreadyExists = user.subscriptions.some(
      (sub) => sub.endpoint === subscription.endpoint
    );

    if (!alreadyExists) {
      user.subscriptions.push(subscription);
      await user.save();
    }

    res.status(201).json({ message: "Subscribed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error saving subscription", error: error.message });
  }
});

// Send notifications (cron checks goals here)
cron.schedule("0 7 * * *", async () => {
  try {
    // Find users with at least one goal where reminder = true
    const users = await User.find({ "goals.reminder.day": true });

    for (const user of users) {
      for (const goal of user.goals) {
        if (goal.reminder.day === true) {
          const payload = JSON.stringify({
            title: "🎯 Goal Reminder",
            body: `Are you working around your ${goal.title} goal.Timer is Running!!`,
          });

          if (user.subscriptions && user.subscriptions.length > 0) {
            for (const sub of user.subscriptions) {
              try {
                await webpush.sendNotification(sub, payload);
                console.log(`✅ Reminder sent for ${goal.title} to ${user.email}`);
              } catch (err) {
                console.error("❌ Push error:", err);
              }
            }
          }
        }
      }
    }
     const today = new Date().toISOString().split("T")[0] // YYYY-MM-DD
    const users1 = await User.find({ "goals.0": { $exists: true } })

    users1.forEach(user => {
      const currentAge = user.dob ? getAge(user.dob) : null
      const isBirthday = user.dob ? isBirthdayToday(user.dob) : false

      user.goals.forEach(goal => {
        const goalDate = goal.day ? resolveDayKeyword(goal.day) : null

        const isAgeMatch = isBirthday && currentAge === goal.targetage
        const isDayMatch = goalDate && goalDate === today

        if (isAgeMatch || isDayMatch) {
          const payload = JSON.stringify({
            title: "🎯 Happy Birthday !",
            body: `Hey ${user.name}, Have you achieved your goal?: ${goal.title}`
          })

          const userSubs = subscriptions.filter(sub => sub[1] === user.google_id)
          userSubs.forEach(sub => {
            webpush.sendNotification(sub[0], payload).catch(err => console.error(err))
          })
        }
      })
    })
  } catch (err) {
    console.error("❌ Error checking goals:", err);
  }
});
cron.schedule("0 7 * * 1", async () => {
  try {
    // Find users with at least one goal where reminder = true
    const users = await User.find({ "goals.reminder.week": true });

    for (const user of users) {
      for (const goal of user.goals) {
        if (goal.reminder.week === true) {
          const payload = JSON.stringify({
            title: "🎯 Goal Reminder",
            body: `Are you working around your ${goal.title} goal.Timer is Running!!`,
          });

          if (user.subscriptions && user.subscriptions.length > 0) {
            for (const sub of user.subscriptions) {
              try {
                await webpush.sendNotification(sub, payload);
                console.log(`✅ Weekly Reminder sent for ${goal.title} to ${user.email}`);
              } catch (err) {
                console.error("❌ Push error:", err);
              }
            }
          }
        }
      }
    }
    
  } catch (err) {
    console.error("❌ Error checking goals:", err);
  }
});
cron.schedule("0 7 1 * *", async () => {
  try {
    // Find users with at least one goal where reminder = true
    const users = await User.find({ "goals.reminder.month": true });

    for (const user of users) {
      for (const goal of user.goals) {
        if (goal.reminder.month === true) {
          const payload = JSON.stringify({
            title: "🎯 Goal Reminder",
            body: `Are you working around your ${goal.title} goal.Timer is Running!!`,
          });

          if (user.subscriptions && user.subscriptions.length > 0) {
            for (const sub of user.subscriptions) {
              try {
                await webpush.sendNotification(sub, payload);
                console.log(`✅ Monthly Reminder sent for ${goal.title} to ${user.email}`);
              } catch (err) {
                console.error("❌ Push error:", err);
              }
            }
          }
        }
      }
    }
   
  } catch (err) {
    console.error("❌ Error checking goals:", err);
  }
});
// Step 1: Redirect user to Google's consent screen
app.get("/auth/google/login", (req, res) => {
  const googleAuthUrl =
    "https://accounts.google.com/o/oauth2/v2/auth?" +
    querystring.stringify({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "consent"
    })

  res.redirect(googleAuthUrl)
})

// Step 2: Handle callback from Google
app.get("/auth/google/callback", async (req, res) => {
  const code = req.query.code
  if (!code) {
    return res.status(400).json({ error: "Missing authorization code" })
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await axios.post("https://oauth2.googleapis.com/token", null, {
      params: {
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      },
    })

    const tokens = tokenResponse.data

    if (!tokens.id_token) {
      return res.status(400).json({ error: tokens })
    }

    // Verify ID token
    const client = new OAuth2Client(GOOGLE_CLIENT_ID)
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: GOOGLE_CLIENT_ID,
    })
    const payload = ticket.getPayload()

    // Build query params to send user info + tokens to frontend
    const params = querystring.stringify({
      email: payload.email,
      name: payload.name,
      google_id: payload.sub,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || "",
    })

    const redirectUrl = `${FRONTEND_URL}/?${params}`

    // Redirect user to frontend with query params
    res.redirect(redirectUrl)
  } catch (err) {
    console.error("Google OAuth Error:", err.response?.data || err.message)
    res.status(500).json({ error: "OAuth callback failed" })
  }
})
const userSchema = new mongoose.Schema(
  {
    google_id: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    // picture: {
    //   type: String,
    // },
    dob: {
      type: String,
      default: null,
    },
    subscriptions: [Object],
    goals: [
      {
        title: String,
        des: String,
        day:String,
        targetage:Number,
        reminder:{
           day:{
            type:Boolean,
            default:false,
           },
            week:{
            type:Boolean,
            default:false,
           },
            month:{
            type:Boolean,
            default:false,
           },
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
)

const User = mongoose.model("User", userSchema)

app.get("/api/user/:google_id", async (req, res) => {
  try {
    console.log("google_id:" + req.params.google_id)
    const user = await User.findOne({ google_id: req.params.google_id })
    if (!user) {
      
      return res.status(404).json({ message: "User not found" })
    }
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Create or update user
app.post("/api/user", async (req, res) => {
  try {
    const { google_id, email, name, dob } = req.body
    console.log("Incoming payload:", req.body)

    let user = await User.findOne({ google_id })

    if (user) {
      // Update existing user
      if (dob !== undefined && dob !== null) user.dob = dob
      if (email) user.email = email
      if (name) user.name = name

      await user.save()
      console.log("Updated user:", user.google_id)
      return res.status(200).json(user)
    }

    // Create new user
    console.log("Creating new user")
    user = new User({
      google_id,
      email,
      name,
      dob: dob || null,
      goals:[],
    })
    await user.save()
    console.log("Created new user:", user.google_id)

    res.status(201).json(user)
  } catch (error) {
    console.error("Error saving user:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})


// Update user's date of birth
app.patch("/api/user/:google_id/dob", async (req, res) => {
  try {
    const { dob } = req.body
    const user = await User.findOneAndUpdate({ google_id: req.params.google_id }, { dob }, { new: true })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json(user)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Add goal to user
app.patch("/api/user/:google_id/goals", async (req, res) => {
  try {
    const user = await User.findOne({ google_id: req.params.google_id })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    if (req.body.des !=null){
    const { title, des ,day,targetage,reminder} = req.body
    user.goals.push({ title, des ,day,targetage,reminder})
    await user.save()
    res.json(user)
    }
    else{
      const { title } = req.body
      user.goals = user.goals.filter((goal) => goal.title !== title)
      await user.save()
      res.json(user)
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})
// === Start server ===
server.listen(PORT, (err) => {
  if (err) console.log(err)
  console.log(`🚀 Server listening on PORT ${PORT}`)
})