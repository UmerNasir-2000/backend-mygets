require("dotenv").config()

const express = require("express")
const cors = require("cors")

const { requireUser, createUser } = require("./auth")

const app = express()

app.use(express.json())
app.use(cors())

app.get("/whoami", requireUser, (req, res) => {
  res.json({ userId: req.user.userId })
})

app.get("/", (_, res) => res.status(200).json({ message: `Hello, World!!!` }))

app.listen(5000, () => console.log(`Server running on port 5000`))
