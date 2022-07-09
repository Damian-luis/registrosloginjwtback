const express = require('express');
const app = express();
const PORT=3001;
const bodyParser = require('body-parser');
const mysql = require('mysql2');
var cors = require('cors')


const jwt= require('jsonwebtoken');
const { applyPatches } = require('immer');


//middlewares
app.use(cors())
app.use(bodyParser.json());
app.listen(PORT,()=>{
    console.log("escuchando en puerto "+PORT);
});
//conexion a mysql
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '1234',
    database : 'registroslogin'
  });
   
  connection.connect(function(err) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }
   
    console.log('connected as id ' + connection.threadId);
  });




//endpoints
app.get("/info",(req, res)=>{
    res.send("funcionando")
})

app.get("/all",(req, res)=>{
    const query = "SELECT * FROM registroslogin";
    connection.query(query,(error,results)=>{
        if(error){throw error;}
        if (results.length){
            res.send(results)
        }
        else{ res.status(500).send("no se ha podido establecer la conexion")}
    })
})
app.post("/add",(req, res)=>{
    const data={
        name:req.body.name,
        password:req.body.password,
        age:req.body.age,
        gender:req.body.gender,
        id:req.body.id,
        lastname:req.body.lastname,
        user:req.body.user
    }
    console.log(data)
    const query="INSERT INTO PERSONAS SET ?";
    connection.query(query,data,(error, results)=>{
        if (error){throw error}
        else{ res.status(200).send("usuario creado con exito")}
        
    })

})
app.get("/user/:user",(req, res)=>{
    const {user,password} = req.params;
    console.log(user)
    const query=`SELECT * FROM personas WHERE user ='${user}'`
    connection.query(query,(error, results)=>{
        if (error){throw error}
        if (results.length){
            res.status(200).send(results)
            console.log("usuario encontrado")
        }
        else{ res.status(500).send("hubo un error :/")}
    })
})



//Autenticacion con JWT



app.post("/login", (req, res)=>{
    const user = {
        user:req.body.user,
        password:req.body.password
    }
    jwt.sign({user:user},"userkey",(err,token)=>{
        res.json({token:token})
    })
    
})


//Authorization: Bearer <token>
function verifyToken(req, res, next){
        const bearerHeader = req.headers['authorization'];
        if (typeof bearerHeader !== "undefined"){
            const verifedToken = bearerHeader.split(" ")[1];
            req.token = verifedToken;
            next();
        }
        else{
            res.sendStatus(403);
        }
}

app.post("/login/verify",verifyToken,(req, res)=>{
//expiresIn no es necesario
    jwt.verify(req.token,"userkey",{expiresIn:"15s"},(error,authData)=>{
        if(error){
            res.sendStatus(403)
        }
        else { res.json({
            mensaje:"creado",
            authData:authData
        })}
    })

})