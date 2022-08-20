const db = require('../database/db.js');

var convertFormat = (object) => {
  let converted = {
    review_id: object.id,
    rating: object.rating,
    summary: object.summary,
    recommend: object.recommend,
    response: object.response,
    body: object.body,
    date: object.date,
    reviewer_name: object["reviwer_name"],
    helpfulness: object.helpfulness,
    photos: [],
  };
  return converted;
}

var getReviews = ({product_id, sort, count, page}) => {
  let criteria;
  switch (sort) {
    case 'newest':
      criteria = 'date DESC';
      break;
    case 'helpful':
      criteria = 'helpfulness DESC';
      break;
    case 'relevent':
      criteria = 'recommend DESC';
      break;
    default:
      criteria = 'date DESC';
  }
  let offset = page === 0 ? 0 : (page - 1) * count;
  return (db.query(`SELECT * FROM reviews WHERE product_id=${product_id} AND reported=false ORDER BY ${criteria} LIMIT ${count} OFFSET ${offset};`)
      .then((data) => {
        return data.rows;
      })
  )
}

var getPhotosForReview = (reviewId) => {
  let criteria;
  return (db.query(`SELECT * FROM reviews_photos WHERE review_id=${reviewId};`)
      .then((photos) => {
        return photos.rows;
      })
  )
}
module.exports = {
  convertFormat,
  getReviews,
  getPhotosForReview
}