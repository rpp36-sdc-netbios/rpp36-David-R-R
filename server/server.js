const express = require('express');
const axios = require('axios');
const path = require('path');
const db = require('../database/db.js');
const helper = require('../database/helper.js');
const convertFormat = helper.convertFormat;
const getReviews = helper.getReviews;
const getPhotosForReview = helper.getPhotosForReview;
const port = 8000;
const app = express();

app.listen(port, () => {
  console.log('Listening on port', port);
});

app.get('/reviews', (req, res) => {
  var {product_id, sort, count, page} = req.query;
  count = count || 5;
  page = page || 0;
  sort = sort || 'newest';

  async function callGetReviews() {
    let reviews = await getReviews({product_id, sort, count, page});
    let photos = [];
    reviews.map((review) => {
      photos.push(Promise.resolve(getPhotosForReview(review.id)));
      return convertFormat(review);
    });
    await Promise.all(photos).then((value) => {
      for (var i = 0; i < value.length; i ++) {
        reviews[i].photos = value[i];
      }
    })
    let query = {
    product: product_id,
    page,
    count,
    results: reviews
    }
    res.send(reviews);
  };

  callGetReviews();
})

//explain analyze
//pagination or endless scroll
//max out at 10 items
//views or materialized views
//