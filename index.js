/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/

'use strict';

const Alexa = require('alexa-sdk');
const utils = require('./utils.js');
const data = require('./data/calendar.json');

const handlers = {
    'LaunchRequest': function() {
        this.emit('Init');
    },
    'Init': function() {
        const greetingMsg = data.GREET_MSG;
        this.emit(':askWithCard', greetingMsg);
    },
    'TotalAstroEvents': function() {
        const noOfAstroEvents = `There are ${(data.astroEvents).length} astronomical events in 2019!`;
        this.emit(':tellWithCard', noOfAstroEvents, data.SKILL_NAME, noOfAstroEvents);
    },
    'NextAstroEvent': function() {
        const getDate = new Date();
        const today = Date.parse(getDate);
        const weekendArr = data.astroEvents;
        const { trimDateStr } = utils;
        let NextAstroEvent = '';

        for(let i = 0; i < weekendArr.length; i++) {
        	if(today < weekendArr[i].holiday_dates) {
        		NextAstroEvent = weekendArr[i];
        		break;
            }
        }
        // TODO: Add a Dialog.Directive. Use Generators to yield subsequent long weekends.
        const outputContent = `The next astronomical event is from ${trimDateStr(new Date(NextAstroEvent.dates[0]))} to ${trimDateStr(new Date(NextAstroEvent.dates[NextAstroEvent.dates.length - 1]))} for the ${NextAstroEvent.occassion}.`;
        this.emit(':tellWithCard', outputContent, data.SKILL_NAME, outputContent);
    },
    'CountByMonth': function() {
        const monthSpoken = (this.event.request.intent.slots.Month.value).toLowerCase();
        const { filterByMonth, normalizeMonth } = utils;
        const month = normalizeMonth(monthSpoken);
        const outputContent = `There are ${(filterByMonth(month, data.astroEvents)).length} astronomical events in the month of ${month}.`;

        // TODO: Add a Dialog.Directive
        this.emit(':tellWithCard', outputContent, data.SKILL_NAME, outputContent);
    },
    'astroEventsByMonth': function() {
        const monthSpoken = (this.event.request.intent.slots.Month.value).toLowerCase();
        const { trimDateStr, filterByMonth, normalizeMonth } = utils;
        const month = normalizeMonth(monthSpoken);
        const monthArr = filterByMonth(month, data.astroEvents);
        const count = (monthArr.length === 0) ? 'no' : monthArr.length;

        let listHolidays = [];

        monthArr.map((week, i) => {
            let { occassion, requireConnectingLeave, holiday_dates, secondaryOccasion, secondaryLeave, connectingLeave, dates } = week;
// Fix this dialogue - not relevant.
            if (!requireConnectingLeave) {
                listHolidays.push(`${(count > 1 ? i+1 : '')}. With ${occassion} being a holiday on ${trimDateStr(new Date(holiday_dates))} ${(secondaryOccasion ? 'and ' + secondaryOccasion + ' on ' + trimDateStr(new Date(secondaryLeave)) : '')}, you get ${dates.length} days of leaves from ${trimDateStr(new Date(dates[0]))} to ${trimDateStr(new Date(dates[dates.length - 1]))}.`);
            } else {
                listHolidays.push(`${(count > 1 ? i+1 : '')}. With ${occassion} being a holiday on ${trimDateStr(new Date(holiday_dates))} ${(secondaryOccasion ? 'and ' + secondaryOccasion + ' on ' + trimDateStr(new Date(secondaryLeave)) : '')}, take a leave on ${trimDateStr(new Date(connectingLeave))} to get ${dates.length} days of leaves from ${trimDateStr(new Date(dates[0]))} to ${trimDateStr(new Date(dates[dates.length - 1]))}.`);
            }
        });

        // TODO: Figure out a way to ignore selective curse words. Mar gets censored to M**
        const combineHolidays = listHolidays.join(', <break time="0.5s"/> ').replace(/Mar/ig, 'March');
        const cardTitle = `Long ${(count > 1 ? 'weekends' : 'weekend')} in ${month}`;
        const cardContent = listHolidays.join(', ').replace(/Mar/ig, 'March');

        this.emit(':tellWithCard', `There ${(count > 1 ? 'are' : 'is')} ${count} astronomical ${(count > 1 ? 'events' : 'event')} in ${month}. ${combineHolidays}`, cardTitle, cardContent);
    },
    'AstroEventsLeft': function() {
        const { astroEvents } = data;
        const getDate = new Date();
        const today = Date.parse(getDate);
        const remainingEvents = AstroEvents.filter(week => week.holiday_dates > today);
        const outputContent = `There are ${remainingEvents.length} possible astronomical events remaining in 2019.`;

        this.emit(':tellWithCard', outputContent, data.SKILL_NAME, outputContent);
    },
    'AMAZON.HelpIntent': function () {
        const { HELP_CARD, HELP_MSG } = data;
        this.emit(':tellWithCard', HELP_MSG, data.SKILL_NAME, HELP_CARD);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', data.STOP_MESSAGE);
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', data.STOP_MESSAGE);
    }
};

exports.handler = (event, context) => {
    const alexa = Alexa.handler(event, context);
    alexa.APP_ID = undefined;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
