import * as readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import fs from 'node:fs'
import moment from 'moment/moment.js'
import OfferCategory from './entity.js'

const isValidDateFormat = (dateString) => moment(dateString, 'YYYY-MM-DD', true).isValid();

const solve = (lastUserValidDate, input) => {
     let offers = [] // hash table
     input.forEach(offer => {
          let offerDate = new Date(offer.valid_to)
          if (OfferCategory.isEligible(offer.category) && (offerDate >= lastUserValidDate)) {
               offer.merchants = [offer.merchants.reduce((accumulator, current) => current.distance < accumulator.distance ? current : accumulator)]

               let decimalIndex = offer.merchants.at(0).distance * 10
               let floorIndex = Math.floor(decimalIndex)

               if (offers.at(floorIndex) == undefined) {
                    offers[floorIndex] = offer
               }
               else {
                    if (offers.at(floorIndex).category != offer.category) {
                         offers[floorIndex + 1] = offer
                    }
                    else {
                         if (offer.merchants.at(0).distance < offers.at(floorIndex).merchants.at(0).distance) {
                              offers[floorIndex] = offer
                         }
                    }
               }
          }
     });

     offers = offers.filter(element => element != undefined)

     return offers.slice(0, 2)
}

const getLastUserValidDate = (rawUserInput) => {
     let checkInDate = new Date(rawUserInput)
     let lastUserValidDate = new Date(checkInDate.getTime())
     lastUserValidDate.setDate(lastUserValidDate.getDate() + 5)
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
