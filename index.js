const express = require('express')
const { getEvents, addEvent } = require("./backend/service");

const expressFileUpload = require('express-fileupload');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(expressFileUpload(null));
app.use(express.static('frontend'));

//backend
app.get('/api/', (req, res) => {
    getEvents().then(response => res.send(JSON.stringify(response)))
});

app.post("/api/createEvent",(req,res)=>{
    addEvent(req.files.file).then(response => res.send(JSON.stringify(response)))
})

app.listen(3000);