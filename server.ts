import dotenv from "dotenv"
dotenv.config()
import express from "express"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import swaggerJsdoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"

import usersRoutes from "./routes/users.routes"
import collaboratorsRoutes from "./routes/collaborators.routes"
import customersRoutes from "./routes/customers.routes"


const app = express()
const PORT = process.env.PORT || 5000
app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true}))

const options = { 
  definition : { 
    openapi : "3.1.0" , 
    info : { 
      title : "Mon API Express avec Swagger" , 
      version : "0.1.0" , 
      description : "Il s'agit d'une application API réalisée avec Express et documentée avec Swagger" , 
    }, 
    servers : [ 
      {
        url : "http://localhost:5000" , 
      } , 
    ], 
  }, 
  apis : [ "./server.ts","./routes/*.ts" ], 
}; 

const specs = swaggerJsdoc(options)
app.use("/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs)
)

//Définitions des routes
app.use("/api/users", usersRoutes)
app.use("/api/collaborators", collaboratorsRoutes)
app.use("/api/customers", customersRoutes)

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})