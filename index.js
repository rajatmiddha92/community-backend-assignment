const express = require('express')
const app = express()
const conn=require('./connection/connection')
const RoleRoutes=require('./routes/roleapi')
const UserRoutes=require('./routes/userapi')
const CommunityRoutes=require('./routes/communityapi')

app.use(express.json())
app.use(RoleRoutes)
app.use(UserRoutes)
app.use(CommunityRoutes)


app.listen(4000)




