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
    reviewer_name: object["reviewer_name"],
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
    case 'relevance':
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
  return (db.query(`SELECT * FROM reviews_photos WHERE review_id=${reviewId};`)
      .then((photos) => {
        return photos.rows;
      })
  )
}

var getMetaData = (product_id) => {
  return (db.query(`SELECT * FROM reviews WHERE product_id=${product_id};`))
    .then((data) => {
      let rating = {};
      let recommended = {};
      let reviews = data.rows;
      for (var i = 0; i < reviews.length; i ++) {
        if (rating[reviews[i].rating] === undefined) {
          rating[reviews[i].rating] = 1;
        } else {
          rating[reviews[i].rating] ++;
        }
        if (recommended[reviews[i].recommend] === undefined) {
          recommended[reviews[i].recommend] = 1;
        } else {
          recommended[reviews[i].recommend] ++;
        }
      }
      return [rating, recommended];
    })
};

var getCharData = (product_id) => {
  return (db.query(`SELECT * FROM characteristics WHERE product_id=${product_id};`))
    .then((char) => {
      var characteristics = {};
      for (var i = 0; i < char.rows.length; i ++) {
        characteristics[char.rows[i].name] = {'id': char.rows[i].id, 'value': 0};
      }
      var query = [];
      var order = [];
      for (var character in characteristics) {
        order.push(character);
        query.push(db.query(`SELECT * FROM characteristics_reviews WHERE characteristics_id=${characteristics[character].id}`))
      }
      return Promise.all(query)
        .then((data) => {
          for (var result of data) {
            for (var row of result.rows) {
              characteristics[order[0]].value += row.value / result.rows.length;
            }
            order.shift();
          }
          return characteristics;
        })
    })
};


module.exports = {
  convertFormat,
  getReviews,
  getPhotosForReview,
  getMetaData,
  getCharData
}