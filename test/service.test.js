const request = require('supertest');
const server = require('../server/server.js');
const db = require('../database/db.js');

describe('GET /reviews?product_id=1', () => {
  test('should return with status code of 200', async () => {
    const response = await request(server).get('/reviews?product_id=1');
    expect(response.statusCode).toBe(200);
  })
  test('should return proper data', async () => {
    var response = await request(server).get('/reviews?product_id=1&sort=newest');
    expect(response.statusCode).toBe(200);
    let data = response.body;
    expect(typeof data).toBe('object');
    expect(data.product).toBeDefined();
    response = await request(server).get('/reviews?product_id=1&sort=helpful');
    expect(data.count).toBeDefined();
    response = await request(server).get('/reviews?product_id=1&sort=relevance');
    expect(data.page).toBeDefined();
    response = await request(server).get('/reviews?product_id=1&sort=notanoption');
    expect(typeof data.results).toBe('object');
  })
  test('should return with status code of 500 when error occurs', async () => {
    const error = await request(server).get('/reviews');
    expect(error.statusCode).toBe(500);
  })
});

describe('GET /reviews without product_id', () => {
  test('should return with status code of 500', async () => {
    const response = await request(server).get('/reviews');
    expect(response.statusCode).toBe(500);
  })
});

describe('GET /reviews/meta?product_id=1', () => {
  test('should return with status code of 200', async () => {
    const response = await request(server).get('/reviews/meta?product_id=1');
    expect(response.statusCode).toBe(200);
  })
  test('should return with proper data', async () => {
    const response = await request(server).get('/reviews/meta?product_id=2');
    let data = response.body;
    expect(typeof data).toBe('object');
    expect(data['product_id']).toBe('2');
    expect(data.characteristics).toBeDefined();
  })
  test('should return with status code of 500 when error occurs', async () => {
    const error = await request(server).get('/reviews/meta');
    expect(error.statusCode).toBe(500);
  })
});

describe('PUT /reviews/:reviewId/helpful', () => {
  test('should return helpfulness of a review', async () => {
    let helpfulness = await db.query(`SELECT helpfulness FROM reviews WHERE id=1`).then((data) => data.rows[0].helpfulness);
    expect(typeof helpfulness).toBe('number');
  })
  test('should increase the helpfulness of a review by 1', async () => {
    let oldHelpfulness = await db.query(`SELECT helpfulness FROM reviews WHERE id=1`).then((data) => data.rows[0].helpfulness);
    expect(typeof oldHelpfulness).toBe('number');
    const response = await request(server).put('/reviews/1/helpful');
    let newHelpfulness = await db.query(`SELECT helpfulness FROM reviews WHERE id=1`).then((data) => data.rows[0].helpfulness);
    expect(oldHelpfulness).toBe(newHelpfulness - 1);
    expect(response.statusCode).toBe(200);
  })
  test('should return with status code of 500 when error occurs', async () => {
    const error = await request(server).put('/reviews/error/helpful');
    expect(error.statusCode).toBe(500);
  })
});

describe('PUT /reviews/:reviewId/report', () => {
  test('should return if a review has been reported', async () => {
    await db.query(`UPDATE reviews SET reported = false WHERE id=1000`);
    let reported = await db.query(`SELECT reported FROM reviews WHERE id=1000`).then((data) => data.rows[0].reported);
    expect(reported).toBe(false);
  })
  test('should change the reported status to true', async () => {
    let notReported = await db.query(`SELECT reported FROM reviews WHERE id=1000`).then((data) => data.rows[0].reported);
    expect(notReported).toBe(false);
    const response = await request(server).put('/reviews/1000/report');
    let reported = await db.query(`SELECT reported FROM reviews WHERE id=1000`).then((data) => data.rows[0].reported);
    expect(reported).toBe(true);
    expect(response.statusCode).toBe(200);
    await db.query(`UPDATE reviews SET reported = false WHERE id=1000`);
  })
  test('should return with status code of 500 when error occurs', async () => {
    const error = await request(server).put('/reviews/error/report');
    expect(error.statusCode).toBe(500);
  })
});

describe('POST /reviews', () => {
  test('should return the number of reviews', async () => {
    let reviews = await db.query(`SELECT id FROM reviews WHERE product_id=100`).then((data) => data.rows);
    expect(typeof reviews).toBe('object');
    expect(typeof reviews.length).toBe('number');
  })
  test('should add a review', async () => {
    let oldReviews = await db.query(`SELECT id FROM reviews WHERE product_id=100`).then((data) => data.rows);
    expect(typeof oldReviews).toBe('object');
    let body = {product_id: 100, rating: 4, summary: 'great', body: 'great', name: 'tester',
       email: 'tester@gmail.com', photos: [], recommend: true}
    const response = await request(server).post('/reviews').send(body);
    let newReviews = await db.query(`SELECT id FROM reviews WHERE product_id=100`).then((data) => data.rows);
    expect(typeof newReviews.length).toBe('number');
    expect(newReviews.length).toBe(oldReviews.length + 1);
  })

});