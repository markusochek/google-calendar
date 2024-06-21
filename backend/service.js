const fs = require('fs')
const {google} = require('googleapis')
const parse = require('csv-parse')

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
    let rows = file.data.split("\n")
    // let headers = rows[0].split(";")
    let events = []

    const authentication = new google.auth.GoogleAuth({
        keyFile: 'backend/credentials.json',
        scopes: 'https://www.googleapis.com/auth/calendar',
    });

    for (let i = 1; i < rows.length; i++) {
        let cells = rows[i].split(";")

        events.push({
            'summary': cells[0],
            'location': 'Hyderabad,India',
            'description': cells[1],
            'start': {
                'dateTime': cells[2],
                'timeZone': 'Asia/Dhaka',
            },
            'end': {
                'dateTime': cells[3],
                'timeZone': 'Asia/Dhaka',
            },
            'reminders': {
                'useDefault': false,
                'overrides': [
                    {'method': 'email', 'minutes': 24 * 60},
                    {'method': 'popup', 'minutes': 10},
                ],
            },
        })
    }

    authentication.getClient().then(auth=>{
        events.forEach((event) => {
            calendar.events.insert({
                auth: auth,
                calendarId: GOOGLE_CALENDAR_ID,
                resource: event,
            }, function(err, event) {
                if (err) {
                    console.log('There was an error contacting the Calendar service: ' + err)
                    return
                }
                // console.log('Event created: %s', event.data)
                return { message: "Event successfully created!" }
            })
        })
    })
}

module.exports = { getEvents, addEvent }