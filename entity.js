const OfferCategory = {
     restaurant: 1,
     retail: 2,
     hotel: 3,
     activity: 4,
     isEligible: (category) => category == OfferCategory.restaurant || category == OfferCategory.retail || category == OfferCategory.activity
}

export default OfferCategory