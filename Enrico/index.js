import { createRequire } from 'module';
const require 		    = createRequire(import.meta.url);
const msgpack 		    = require('msgpack');
const StreamrClient     = require('streamr-client');
const multer            = require('multer');
const upload            = multer({ dest:'uploads/'});
const fs                = require('fs');
const axios             = require('axios');
const url = 'https://occupancyapi.hopto.org/enrico/encrypt'

/**
********* PARÁMETROS ENVÍO DE DATOS ********* 
**/

let eth_key 		= "";
let policy_pubkey   = "";
let name            = "";
let image           = "";
let total_occupancy     = 0 ;
let account         = "";

let client =  null;
let msg = {};
let timestamp = 0;

/**
********* PARÁMETROS RESTAURANTE ********* 
**/

let now_occupancy    = 0;
let porcentaje      = 0;
let min		        = 5;
/**
********* FUNCIÓN DE PUBLICACIÓN DE DATOS *********
**/

async function makeHttp(data) { 
    return new Promise(function (resolve, reject) { 
        axios.post(url,data).then( 
            (response) => { 
                var result = response.data; 
                resolve(result); 
            }, 
            (error) => { 
                reject(error); 
            } 
        ); 
    }); 
} 

function enviarDatos() {
    console.log("Generating occupancy data...")

    now_occupancy = Math.round(Math.random() * (total_occupancy - min) + min);
    porcentaje = Math.round((now_occupancy / total_occupancy)*100);
    timestamp = Date.now();

    let data = {};
    let plaintext = {
        'total_occupancy': total_occupancy,
        'now_occupancy': now_occupancy,
        'percent': porcentaje,
        'timestamp':timestamp
    }
    
    data["data"]            = JSON.stringify(plaintext);
    data["policy_pubkey"]   = policy_pubkey;

    console.log("Sending data to API...")

    makeHttp(data).then(res => {
        msg = JSON.parse(res);
        console.log("Incoming data from API: ",res)
        client.getOrCreateStream({name: policy_pubkey}).then((stream) =>
            stream.publish(msg)
                    .then(() => console.log('Data sent to Streamr '))
                    .catch( (err) => console.error(err) )
        )
    });
};



/**
********* HTTP SERVER ********* 
**/

const express = require("express");
const app = express();

app.use(express.static('static'));
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
    if(!req.app.get('data')){
        res.render('index',{});
    }else{
        res.render('error');
    }
});

app.post('/upload', upload.single('file'), (req, res) => {
    if(!req.app.get('data')){
        try{
            let data = JSON.parse(fs.readFileSync(req.file.path, 'utf8'));
            console.log("Datos de enrico recibidos: ",JSON.stringify(data));

            // Datos de restaurante
            name = data["name"];
            image = data["image"];
            total_occupancy = data["total_occupancy"];
            account = data["account"];

            // Datos de enrico
            policy_pubkey = data["policy_pubkey"];
            eth_key = data["private_key"];
            client = new StreamrClient({auth:{privateKey: eth_key}})

            //Borro los datos guardados y publico la parte "datos" del servidor.
            fs.rmdirSync('uploads/', { recursive: true });
            app.set('data',true);
            enviarDatos();
            setInterval(enviarDatos, 5000);

            return res.status(200).send(req.file);
        }catch(err){
            return res.status(422).json({ error: 'File upload error' });
        }
    }else{
        res.render('error'); 
    }
});

app.get('/data', function(req, res) {
    if(req.app.get('data')){
        let now = (new Date(timestamp)).toLocaleString();
        var isAjaxRequest = req.xhr;
        if (isAjaxRequest){
            res.send({'enrico':msg.enrico,'ciphertext': msg.ciphertext, 'policy_pubkey': policy_pubkey, 'timestamp':now,'now_occupancy':now_occupancy,'porcentaje':porcentaje});
        }else{
            res.render('datos',{'name':name,'account':account,'imagen':image,'total_occupancy':total_occupancy,'policy_pubkey':policy_pubkey,'enrico':msg.enrico,'timestamp':now,'ciphertext': msg.ciphertext, 'now_occupancy':now_occupancy,'porcentaje':porcentaje});
        }
    }else{
        res.render('error');
    }
});


const hostname 	= '192.168.1.57';
const port = "9000";
app.listen(port,hostname, () => {
    console.log(`Waiting Enrico config in http://${hostname}:${port}/ ...`);
});

