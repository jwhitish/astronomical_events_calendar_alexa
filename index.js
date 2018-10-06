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
    'TotalLongWeekends': function() {
        const noOfLongWeekends = `There are ${(data.longWeekends).length} possible long weekends in 2018!`;
        this.emit(':tellWithCard', noOfLongWeekends, data.SKILL_NAME, noOfLongWeekends);
    },
    'NextLongWeekend': function() {
        const getDate = new Date();
        const today = Date.parse(getDate);
        const weekendArr = data.longWeekends;
        const { trimDateStr } = utils;
        let nextLongWeekend = '';
        
        for(let i = 0; i < weekendArr.length; i++) {
        	if(today < weekendArr[i].holiday_dates) {
        		nextLongWeekend = weekendArr[i];
        		break;
            }
        }
        // TODO: Add a Dialog.Directive. Use Generators to yield subsequent long weekends.
        const outputContent = `The next long weekend is from ${trimDateStr(new Date(nextLongWeekend.dates[0]))} to ${trimDateStr(new Date(nextLongWeekend.dates[nextLongWeekend.dates.length - 1]))} on the occassion of ${nextLongWeekend.occassion}.`;
        this.emit(':tellWithCard', outputContent, data.SKILL_NAME, outputContent);
    },
    'CountByMonth': function() {
        const monthSpoken = (this.event.request.intent.slots.Month.value).toLowerCase();
        const { filterByMonth, normalizeMonth } = utils;
        const month = normalizeMonth(monthSpoken);
        const outputContent = `There are ${(filterByMonth(month, data.longWeekends)).length} long weekends in the month of ${month}.`;
        
        // TODO: Add a Dialog.Directive
        this.emit(':tellWithCard', outputContent, data.SKILL_NAME, outputContent);
    },
    'LongWeekendsByMonth': function() {
        const monthSpoken = (this.event.request.intent.slots.Month.value).toLowerCase();
        const { trimDateStr, filterByMonth, normalizeMonth } = utils;
        const month = normalizeMonth(monthSpoken);
        const monthArr = filterByMonth(month, data.longWeekends);
        const count = (monthArr.length === 0) ? 'no' : monthArr.length;
        
        let listHolidays = [];
        
        monthArr.map((week, i) => {
            let { occassion, requireConnectingLeave, holiday_dates, secondaryOccasion, secondaryLeave, connectingLeave, dates } = week;
            
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
    
        this.emit(':tellWithCard', `There ${(count > 1 ? 'are' : 'is')} ${count} long ${(count > 1 ? 'weekends' : 'weekend')} in ${month}. ${combineHolidays}`, cardTitle, cardContent);
    },
    'LongWeekendsLeft': function() {
        const { longWeekends } = data;
        const getDate = new Date();
        const today = Date.parse(getDate);
        const remainingWeekends = longWeekends.filter(week => week.holiday_dates > today);
        const outputContent = `There are ${remainingWeekends.length} possible long weekends remaining in 2018.`;
        
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