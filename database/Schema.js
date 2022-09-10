let ratingsSchema = mongoose.Schema({
  reviewId: Number,
  productId: Number,
  helpfulness: Number,
  rating: Number,
  summary: String,
  username: String,
  useremail: String,
  photo: [{
    id: Number,
    url: String
  }]
})

let metaSchema = mongoose.Schema({
  productId: Number,
  ratings: Number,
  recommended: Number,
  characteristics: {
    size: Number,
    width: Number,
    comfort: Number,
    quality: Number,
    length: Number,
    fit: Number
  }
})