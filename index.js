var got = require('got' )
var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var api = express.Router()

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

api.get('/GenCheckMacValue', function(req, res, next){
    try{
        req.query.body = JSON.parse(req.query.body)
    }catch(er){
        req._error = 'JSON parse error'
        next()
    }

    got.post('https://payment.allpay.com.tw/AioHelper/GenCheckMacValue', {
        body: req.query.body
    })
    .then( function(resp){
        if(/^Error/i.test(resp.body)){
            req._error = resp.body
        }else{
            req._json = {
                value: resp.body
            }
        }
        next()
    })
})

api.use(function (req, res, next){
    req._json = {
        code: res.statusCode,
        status: 'success',
        method: req.method,
        version: 'v1',
        data: req._json
    }

    if(req._error){
        req._json.status = 'error'
        req._json.error = req._error
    }

    if(req.query.callback){
        res.send(`${req.query.callback}(${JSON.stringify(req._json)})`)
    }else{
        res.json(req._json)
    }
})

app.use('/api/v1', api)
app.listen(3001)