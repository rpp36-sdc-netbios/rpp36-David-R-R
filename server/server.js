const express = require('express');
const axios = require('axios');
const path = require('path');
const db = require('../database/db.js');
const helper = require('../database/helper.js');
const convertFormat = helper.convertFormat;
const getReviews = helper.getReviews;
const getPhotosForReview = helper.getPhotosForReview;
const getMetaData = helper.getMetaData;
const getCharData = helper.getCharData;
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
    reviews = reviews.map((review) => {
      photos.push(Promise.resolve(getPhotosForReview(review.id)));
      return convertFormat(review);
    });
    await Promise.all(photos).then((value) => {
      for (var i = 0; i < value.length; i ++) {
        reviews[i].photos = value[i];
      }
    })
    let queryResult = {
    product: product_id,
    page,
    count,
    results: reviews
    }
    res.status(200).send(queryResult);
  };

  try {
    callGetReviews();
  } catch (e) {
    console.log('error', e);
    res.sendStatus(500);
  }
});

app.get('/reviews/meta', (req, res) => {
  var {product_id} = req.query;
  async function callGetMetaData() {
    var [ratings, recommended] = await getMetaData(product_id);
    var characteristics = await getCharData(product_id);
    var metaData = {
      product_id, ratings, recommended, characteristics
    };
    res.status(200).send(metaData);
  }
  try {
    callGetMetaData();
  } catch (e) {
    console.log('error', e);
    res.sendStatus(500);
  }
});

//explain analyze
//pagination or endless scroll
//max out at 10 items
//views or materialized views
//