const express = require('express')
const cors = require('cors')
const app = express()
const port = 3000
const rateLimit = require('express-rate-limit')


const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 100,
	standardHeaders: 'draft-7',
	legacyHeaders: false
})

app.use(cors())
app.use(limiter)

app.get('/stop/:id', async (req, res) => {
    let apiQuery = await fetch(`https://www.zditm.szczecin.pl/api/v1/displays/${req.params.id}`, {method: 'GET'});
    let response = await apiQuery.json();
    let busArrivals = response.departures;
    let arrivingBusesArray = []
    let currentTime = new Date()
    currentTime.setHours(currentTime.getHours() + 1)
    busArrivals.forEach(element => {
        if (arrivingBusesArray.length > 5) { return }

        if (element.time_scheduled) {
            let arrivalTime = new Date()
            let hours = element.time_scheduled.slice(0,2)
            let minutes = element.time_scheduled.slice(-2)
            arrivalTime.setHours(hours)
            arrivalTime.setMinutes(minutes)
            arrivingBusesArray.push({
                line: element.line_number,
                arrival: Math.floor((currentTime - arrivalTime) / 60000)
            })
        }
        else {
            arrivingBusesArray.push({
                line: element.line_number,
                arrival: element.time_real
            })
        }
    });
    res.json({
        'response': response,
        'date': currentTime,
        'busArray': arrivingBusesArray,
    });
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})