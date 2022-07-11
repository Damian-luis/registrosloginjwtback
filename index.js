const express = require('express');
const app = express();
const PORT=3001;
const bodyParser = require('body-parser');
const mysql = require('mysql2');
var cors = require('cors')


const jwt= require('jsonwebtoken');



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
    const query = "SELECT * FROM personas";
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
app.get("/user/:user/:password",(req, res)=>{
    const {user,password} = req.params;
    
    const query=`SELECT * FROM personas WHERE user ='${user}'`
    connection.query(query,(error, results)=>{
        if (error){throw error}
        if (results.length){
            //a partir de aqui prueba
            if(results[0].password===password){
                res.status(200).send(results)
            console.log("usuario encontrado")

            }
            else{console.log("usuario o contraseña incorrectos")}
            
            //hasta aqui
            
        }
        else{ res.status(500).send("hubo un error :/")}
    })
})



//Autenticacion con JWT


/*  DESCOMENTAR
app.post("/login", (req, res)=>{
    const user = {
        user:req.body.user,
        password:req.body.password
    }
    jwt.sign({user:user},"userkey",(err,token)=>{
        res.json({token:token})
    })
    
})     */
app.post("/login/:user/:password", (req, res)=>{
    
    const users = {
        user:req.body.user,
        password:req.body.password
    }
    const user=req.body.user
    const password=req.body.password
console.log(password)
    const query=`SELECT * FROM personas WHERE user ='${user}'`
    connection.query(query,(error, results)=>{
        if (error){throw error}
        if (results.length){
            //a partir de aqui prueba, le digo que si encuentra el usuario en db, que firme y mande token
            if(results[0].password===password){
                console.log("llegaste aqui")
                jwt.sign({users:users},"userkey",(err,token)=>{
                    res.json({token:token})
                })
            console.log("usuario encontrado")

            }
            else{console.log("usuario o contraseña incorrectos")}
            
            //hasta aqui
            
        }
        //else{ res.status(500).send("hubo un error :/")}
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
const data={
    product:req.body.product,
    price:req.body.price,
    description:req.body.description
}
const query="INSERT INTO compras SET ?"
connection.query(query,data,(err, data)=>{
    if(err){throw err;}
    else{ res.status(200).send("agregado con exito")}
})




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