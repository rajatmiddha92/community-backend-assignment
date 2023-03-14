const express = require('express')
const app = express()
const conn=require('./connection/connection')
const RoleRoutes=require('./routes/roleapi')
const UserRoutes=require('./routes/userapi')
const CommunityRoutes=require('./routes/communityapi')
const MemberRoutes=require('./routes/memberapi')

let port =process.env.PORT ||  5500;

app.use(express.json())
app.use(RoleRoutes)
app.use(UserRoutes)
app.use(CommunityRoutes)
app.use(MemberRoutes)

//testing purpose deply on remote server
app.get('/',(req,res)=>{
    res.send('working fine')
})


app.listen(port)




