const db = require('../database/db.js');

var convertFormat = (object) => {
  var ISOdate = new Date(parseInt(object.date)).toISOString();
  let converted = {
    review_id: object.id,
    rating: object.rating,
    summary: object.summary,
    recommend: object.recommend,
    response: object.response,
    body: object.body,
    date: ISOdate,
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
      criteria = 'recommend DESC';
  }
  let offset = page === 0 ? 0 : (page - 1) * count;
  return (db.query(`SELECT * FROM reviews WHERE product_id=${product_id} AND reported=false ORDER BY ${criteria} LIMIT ${count} OFFSET ${offset};`)
      .then((data) => {
        return data.rows;
      })
      .catch((err) => {
        throw err;
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
  return (db.query(`SELECT * FROM characteristics_reviews
  JOIN characteristics ON characteristics.id = characteristics_reviews.characteristics_id
  JOIN reviews ON reviews.id = characteristics_reviews.review_id
  WHERE characteristics.product_id = ${product_id};`))
    .then((data) => {
      let rating = {};
      let recommended = {};
      let visited = {};
      let reviews = data.rows;
      for (var i = 0; i < reviews.length; i ++) {
        if (visited[reviews[i]['review_id']] === undefined) {
          visited[reviews[i]['review_id']] = true;
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
      }
      let response = data.rows;
      let charCollection = {};
      for (var i = 0; i < response.length; i ++) {
        let charName = response[i].name;
        let charNum = response[i]['characteristics_id'];
        if (charCollection[charName] === undefined) {
          charCollection[charName] = {};
          charCollection[charName]['id'] = charNum;
          charCollection[charName]['value'] = [response[i].value, 1];
        } else {
          charCollection[charName].value[0] += response[i].value;
          charCollection[charName].value[1] ++;
        }
      }
      for (var char in charCollection) {
        charCollection[char].value = charCollection[char].value[0] / charCollection[char].value[1];
      }
      return [rating, recommended, charCollection];
    })
    .catch((err) => {
      throw err;
    })
};

var clickedHelpful = (reviewId) => {
  return db.query(`UPDATE reviews SET helpfulness = helpfulness + 1 WHERE id=${reviewId};`)
    .then((data) => {
      return true;
    })
    .catch((err) => {
      return false;
    })
}

var clickedReport = (reviewId) => {
  return db.query(`UPDATE reviews SET reported = true WHERE id=${reviewId};`)
    .then((data) => {
      return true;
    })
    .catch((err) => {
      return false;
    })
}

var submitReview = ({product_id, rating, summary, body, name, email, photos, characteristics, recommend}) => {
  let date = new Date().getTime();
  return db.query(`INSERT INTO reviews (product_id, rating, summary, body, reviewer_name, reviewer_email, recommend, reported, date)
  VALUES (${product_id}, ${rating}, '${summary}', '${body}', '${name}', '${email}', ${recommend}, false, ${date}) RETURNING id;`)
    .then((data) => {
      let review_id = data.rows[0].id;
      let charPromises = [];
      for (characteristic in characteristics) {
        charPromises.push(db.query(`INSERT INTO characteristics_reviews (review_id, characteristics_id, value)
         VALUES (${review_id}, ${characteristic}, ${characteristics[characteristic]});`))
      }
      Promise.all(charPromises)
        .then((data) => {
          return true;
        })
    })
    .catch((err) => {
      return false;
    })
}

module.exports = {
  convertFormat,
  getReviews,
  getPhotosForReview,
  getMetaData,
  clickedHelpful,
  clickedReport,
  submitReview
}