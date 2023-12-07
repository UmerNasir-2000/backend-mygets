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
  updateOrg,
  deleteOrg
} = require("./auth")

const app = express()

app.use(cors())
app.use(express.json())

app.get("/whoami", requireUser, (req, res) => {
  res.json({ userId: req.user.userId })
})

app.get("/list-organizations", requireUser, async (req, res) => {
  const userDetails = await fetchUserMetadataByEmail(req.user.email, true)
  return res.status(200).json(Object.values(userDetails.orgIdToOrgInfo))
})

app.delete("/organizations", requireUser, async (req, res) => {
  await deleteOrg(`ab54cb98-9be1-424a-92a0-3180ae9577f5`)
  await deleteOrg(`2e8b613e-1c45-4d9e-8b43-ced9fd84ce51`)
  await deleteOrg(`10147d84-e39b-4def-80fe-c6d7026e433d`)
  await deleteOrg(`a704654e-af82-4ba0-a999-7938eecd0cbd`)
  await deleteOrg(`85c2dbb5-4bab-4730-9c0d-c0c02850a443`)
  await deleteOrg(`146c5b00-a475-48ea-baa1-ad50890d4964`)

  return res.status(200).json({ success: true})
})

app.post("/create-organization", requireUser, async (req, res) => {
  const organization = await createOrg({ name: req.body.name })

  console.log('organization', organization)

  await addUserToOrg({
    orgId: organization.orgId,
    userId: req.user.userId,
    role: `Admin`,
  })

  await updateOrg({ orgId: organization.orgId, metadata: { country: req.body.country, industryType: req.body.industryType, tenderProducts: req.body.tenderProducts } })

  return res.status(201).json({ success: true })
})

app.post("/invite", requireUser, async (req, res) => {
  const users = await fetchUsersByQuery({ emailOrUsername: req.body.email })

  if (users.length === 0)
    return res.status(404).json({ message: `User not found` })

  const invitee = await inviteUserToOrg({
    email: req.body.email,
    orgId: req.body.orgId,
    role: req.body.role,
  })

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
