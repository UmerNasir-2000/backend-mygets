require("dotenv").config()

const express = require("express")
const cors = require("cors")

const { requireUser, createUser, createAccessToken, fetchUserMetadataByEmail } = require("./auth")

const app = express()

app.use(express.json())
app.use(cors())

app.get("/whoami", requireUser, (req, res) => {
  res.json({ userId: req.user.userId })
})

app.post(`/create-user`, async (req, res) => {
  const { email, password } = req.body

  try {

    const existingUser = await fetchUserMetadataByEmail(email);

    if (existingUser) {
      return res.status(409).json({ message: `User already exists` })
    }
    const user = await createUser({
      email,
      password,
      sendEmailToConfirmEmailAddress: false,
      emailConfirmed: true,
    })
    console.log("user", user)
    const token = await createAccessToken({
      userId: user.userId,
      durationInMinutes: 60,
    })
    
    return res.status(201).json({ userId: user.userId, token })
  } catch (error) {
    console.log("error", error)
    return res.status(500).json({ message: error.message })
  }
})

app.get("/", (_, res) => res.status(200).json({ message: `Hello, World!!!` }))

app.listen(5000, () => console.log(`Server running on port 5000`))
