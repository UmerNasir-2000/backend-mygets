require("dotenv").config()

const express = require("express")
const cors = require("cors")

const {
  requireUser,
  createUser,
  createAccessToken,
  fetchUserMetadataByEmail,
  createOrg,
  addUserToOrg,
  fetchUsersByQuery,
  inviteUserToOrg,
} = require("./auth")

const app = express()

// var whitelist = ['http://localhost:3000', 'https://website-mygets.vercel.app/', `*`]

// var corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }
//   }
// }

// app.use(cors(corsOptions))
app.use(cors())
app.use(express.json())

app.get("/whoami", requireUser, (req, res) => {
  res.json({ userId: req.user.userId })
})

app.get("/list-organizations", requireUser, async (req, res) => {
  const userDetails = await fetchUserMetadataByEmail(req.user.email, true)
  return res.status(200).json(Object.values(userDetails.orgIdToOrgInfo))
})

app.post("/create-organization", requireUser, async (req, res) => {
  const organization = await createOrg({ name: req.body.name })
  const orgResponse = await addUserToOrg({
    orgId: organization.orgId,
    userId: req.user.userId,
    role: `Admin`,
  })
  return res.status(201).json({ success: true })
})

app.post("/invite", requireUser, async (req, res) => {
  console.log('req.body', req.body)
  const users = await fetchUsersByQuery({ emailOrUsername: req.body.email })

  console.log('users', users)
  if (users.length === 0)
    return res.status(404).json({ message: `User not found` })

  const invitee = await inviteUserToOrg({
    email: req.body.email,
    orgId: req.body.orgId,
    role: req.body.role,
  })

  console.log('invitee', invitee)

  return res.status(201).json({ invitee })
})

app.post(`/create-user`, async (req, res) => {
  const { email, password } = req.body

  try {
    const existingUser = await fetchUserMetadataByEmail(email)

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
