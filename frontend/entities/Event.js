const Event = class {
    summary
    description
    startDateTime
    endDateTime

    constructor(event) {
        this.summary = event.summary
        this.description = event.description
        this.startDateTime = event.startDateTime
        this.endDateTime = event.endDateTime
    }
}

module.exports = { Event }