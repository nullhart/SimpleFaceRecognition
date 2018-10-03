var Smarty = require('./core.js')

Smarty.start(2000)


Smarty.confirmIdentify().then(result => {
    console.log(result)
})