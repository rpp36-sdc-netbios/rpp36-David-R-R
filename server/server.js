const express = require('express');
const axios = require('axios');
const path = require('path');
const db = require('../database/db.js');
const helper = require('../database/helper.js');
const {convertFormat, getReviews, getPhotosForReview, getMetaData, clickedHelpful, clickedReport, submitReview} = helper;
const port = 8000;
const bodyParser = require('body-parser').json();
const app = express();

app.listen(port, () => {
  console.log('Listening on port', port);
});

app.get('/reviews', (req, res) => {
  var {product_id, sort, count, page} = req.query;
  count = count || 5;
  page = page || 0;
  sort = sort || 'relevance';
  if (product_id === undefined) {
    return res.sendStatus(500);
  }
  async function callGetReviews() {
    try {
      let reviews = await getReviews({product_id, sort, count, page});
      let photos = [];
      reviews = reviews.map((review) => {
        photos.push(Promise.resolve(getPhotosForReview(review.id)));
        return convertFormat(review);
      });
      await Promise.all(photos).then((value) => {
        for (var i = 0; i < value.length; i ++) {
          let reviewPhotos = value[i];
          if (reviewPhotos.length !== 0) {
            reviews[i].photos = reviewPhotos;
          }
        }
      })
      let queryResult = {
      product: product_id,
      page,
      count,
      results: reviews
      }
      res.status(200).send(queryResult);
    } catch (e) {
      console.log('error', e);
      res.sendStatus(500);
    }
  };
  callGetReviews();
});

app.get('/reviews/meta', (req, res) => {
  var {product_id} = req.query;
  async function callGetMetaData() {
    try {
      var [ratings, recommended, characteristics] = await getMetaData(product_id);
      var metaData = {
        product_id, ratings, recommended, characteristics
      };
      res.status(200).send(metaData);
    } catch (e) {
      res.sendStatus(500);
    }
  }
  callGetMetaData();
});

app.put('/reviews/:reviewId/helpful', (req, res) => {
  let reviewId = req.params.reviewId;
  clickedHelpful(reviewId)
    .then((worked) => {
      if (worked) {
        res.sendStatus(200);
      } else {
        res.sendStatus(500);
      }
    })
})


app.put('/reviews/:reviewId/report', (req, res) => {
  let reviewId = req.params.reviewId;
  clickedReport(reviewId)
    .then((worked) => {
      if (worked) {
        res.sendStatus(200);
      } else {
        res.sendStatus(500);
      }
    })
})

app.post('/reviews', bodyParser, (req, res) => {
  var {product_id, rating, summary, body, name, email, photos, characteristics, recommend} = req.body;
  submitReview({product_id, rating, summary, body, name, email, photos, characteristics, recommend})
    .then((worked) => {
      if (worked) {
        res.sendStatus(200);
      } else {
        res.sendStatus(500);
      }
    })
});

module.exports = app;

//explain analyze
//pagination or endless scroll
//max out at 10 items
//views or materialized views
//
