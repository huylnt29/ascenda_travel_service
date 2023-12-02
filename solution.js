import * as readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import fs from 'node:fs'
import moment from 'moment/moment.js'
import OfferCategory from './entity.js'
import QueryOption from './query_option.js'

const isValidDateFormat = (dateString) => moment(dateString, 'YYYY-MM-DD', true).isValid();

const solve = (lastUserValidDate, input) => {
     let offers = [] // hash table
     input.forEach(offer => {
          let offerDate = new Date(offer.valid_to)
          if (OfferCategory.isEligible(offer.category) && (offerDate >= lastUserValidDate)) {
               offer.merchants = [offer.merchants.reduce((accumulator, current) => current.distance < accumulator.distance ? current : accumulator)]

               let decimalIndex = offer.merchants.at(0).distance * 10
               let floorIndex = Math.floor(decimalIndex)

               while (true) {
                    console.log(floorIndex)
                    if (offers.at(floorIndex) == undefined) {
                         offers[floorIndex] = offer
                         break
                    }
                    else {
                         if (offers.at(floorIndex).category == offer.category && offer.merchants.at(0).distance <= offers.at(floorIndex).merchants.at(0).distance) {
                              offers[floorIndex] = offer
                              break
                         }
                         else if (offers.at(floorIndex).category != offer.category) {
                              if (offers.at(floorIndex).merchants.at(0).distance > offer.merchants.at(0).distance) {
                                   offers.splice(floorIndex, 0, offer)
                                   break
                              }
                              else {
                                   floorIndex += 1
                              }
                         }
                    }
               }
              
          }
     });

     offers = offers.filter(element => element != undefined)

     return offers.slice(0, QueryOption.maxOffers)
}

const getLastUserValidDate = (rawUserInput) => {
     let checkInDate = new Date(rawUserInput)
     let lastUserValidDate = new Date(checkInDate.getTime())
     lastUserValidDate.setDate(lastUserValidDate.getDate() + QueryOption.userValidDayRange)
     return lastUserValidDate
}

const main = async () => {
     const rl = readline.createInterface({ input, output });
     let rawUserInput;
     while (!isValidDateFormat(rawUserInput)) {
          rawUserInput = await rl.question('\n<- User check-in date? ')
     }
     rl.close();

     const lastUserValidDate = getLastUserValidDate(rawUserInput)

     const jsonString = fs.readFileSync('input.json', 'utf8');
     const data = JSON.parse(jsonString);

     let result = solve(lastUserValidDate, data.offers)

     console.log('\n-> Quick-view result:\n____________________________\n\n', result, '\n____________________________\n')

     result = JSON.stringify({
          "offers": result
     })

     fs.writeFile('output.json', result, () => {
          console.log('-> The file has been written!\n');
     });
}

await main()
