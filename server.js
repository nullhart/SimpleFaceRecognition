const express = require('express')
const app = express()
const core = require('./core.js')
const bodyParser = require('body-parser')

app.use(express.static(__dirname + '/public'));
app.use('/node_modules/tracking/', express.static(__dirname + '/node_modules/tracking'));
app.use('/node_modules/axios/', express.static(__dirname + '/node_modules/axios'));
app.use(bodyParser.json());

app.get('/', (req, res) => res.sendFile(__dirname + '/cam.html'))

app.get('/check', function (req, res) {
    core.confirmIdentify().then(result => {
        res.send({
            confidence: result,
            person: result >= 75 ? 'Its blake' : 'not Blake'
        })
    })

})

app.listen(8080, () => console.log('Example app listening on port 8080!'))