const fs = require('fs')
const csvParser = require("csv-parser");
const {google} = require('googleapis')
const { Event } = require('.././frontend/entities/Event')

const GOOGLE_PROJECT_NUMBER = "go-calendar-427007"
const GOOGLE_CALENDAR_ID = "60cc845aa7a6bb49efd6a54c6a05e869ae6fa175bc05c1774ed997e06701527b@group.calendar.google.com"

const credentials = JSON.parse(fs.readFileSync(
    'backend/credentials.json',
    'utf8'
))

const jwtClient = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    'https://www.googleapis.com/auth/calendar.readonly'
)

const calendar = google.calendar({
    version: 'v3',
    project: GOOGLE_PROJECT_NUMBER,
    auth: jwtClient
})

const authentication = new google.auth.GoogleAuth({
    keyFile: 'backend/credentials.json',
    scopes: 'https://www.googleapis.com/auth/calendar',
});

const getEvents = async () => {
    calendar.events.list({
        calendarId: GOOGLE_CALENDAR_ID,
        timeMin: (new Date()).toISOString(),
        maxResults: 3000,
        singleEvents: true,
        orderBy: 'startTime',
    }, (error, result) => {
        if (error) {
            return { error: error }
        } else {
            if (result.data.items.length) {
                return { events: result.data.items }
            } else {
                return { message: 'No upcoming events found.' }
            }
        }
    });
}

const addEvent = async (file) => {
    fs.writeFile('backend/files/' + file.name, file.data, (err) => {
        if (err) throw new Error()
    })

    //костыльно поправить бы
    let promise =  new Promise((resolve, reject) => fs.createReadStream('backend/files/' + file.name)
        .pipe(csvParser({separator: ';'}))
        .on("data", (event) => {
            let eventFull = {
                'summary': event.summary,
                'description': event.description,
                'start': {
                    'dateTime': new Date(event.startDateTime),
                    'timeZone': 'Europe/Samara',
                },
                'end': {
                    'dateTime': new Date(event.endDateTime),
                    'timeZone': 'Europe/Samara',
                },
                'reminders': {
                    'useDefault': false,
                    'overrides': [
                        {'method': 'email', 'minutes': 24 * 60},
                        {'method': 'popup', 'minutes': 10},
                    ],
                },
            }

            authentication.getClient().then(auth=>{
                calendar.events.insert({
                    auth: auth,
                    calendarId: GOOGLE_CALENDAR_ID,
                    resource: eventFull,
                }, function(err, event) {
                    if (err) throw new Error(err)
                })
            })
        })
        .on("end", () => { resolve()}))
    return { message: "Events successfully created! Please check your google calendar" }
}

module.exports = { getEvents, addEvent }