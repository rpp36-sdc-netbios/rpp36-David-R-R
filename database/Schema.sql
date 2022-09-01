\c postgres;
DROP DATABASE IF EXISTS ratingsandreviews;
CREATE DATABASE ratingsandreviews;
\c ratingsandreviews;

CREATE TABLE IF NOT EXISTS product (
  id serial PRIMARY KEY,
  name VARCHAR(50),
  slogan text,
  description text,
  category VARCHAR(50),
  default_price int
);

CREATE TABLE IF NOT EXISTS reviews (
  id serial PRIMARY KEY,
  product_id int,
  rating int,
  date bigint,
  summary text,
  body text,
  recommend boolean,
  reported boolean,
  reviewer_name text,
  reviewer_email text,
  response text,
  helpfulness int,
  FOREIGN KEY (product_id) REFERENCES product (id)
);

CREATE TABLE IF NOT EXISTS reviews_photos (
  id serial PRIMARY KEY,
  review_id int,
  url text,
  FOREIGN KEY (review_id)
    REFERENCES reviews (id)
);

CREATE TABLE IF NOT EXISTS characteristics (
  id serial PRIMARY KEY,
  product_id int,
  name VARCHAR(10),
  FOREIGN KEY (product_id)
    REFERENCES product (id)
);

CREATE TABLE IF NOT EXISTS characteristics_reviews (
  id serial PRIMARY KEY,
  characteristics_id int NOT NULL,
  review_id int NOT NULL,
  value int,
  FOREIGN KEY (characteristics_id) REFERENCES characteristics (id),
  FOREIGN KEY (review_id) REFERENCES reviews (id)
);

copy product from '/Users/davidlim/hackReactor/Course/sdc-netbios/rpp36-david-RatingsAndReview/data/product.csv' csv header;
copy reviews from '/Users/davidlim/hackReactor/Course/sdc-netbios/rpp36-david-RatingsAndReview/data/reviews.csv' csv header;
copy characteristics from '/Users/davidlim/hackReactor/Course/sdc-netbios/rpp36-david-RatingsAndReview/data/characteristics.csv' csv header;
copy characteristics_reviews from '/Users/davidlim/hackReactor/Course/sdc-netbios/rpp36-david-RatingsAndReview/data/characteristic_reviews.csv' csv header;
copy reviews_photos from '/Users/davidlim/hackReactor/Course/sdc-netbios/rpp36-david-RatingsAndReview/data/reviews_photos.csv' csv header;
CREATE INDEX review_id_index ON reviews(id);
CREATE INDEX reviews_photos_index ON reviews_photos(review_id);
CREATE INDEX reviews_productid_index ON reviews(product_id);
CREATE INDEX characteristics_characteristics_id_index ON characteristics_reviews(characteristics_id);
CREATE INDEX characteristics_product_id_index ON characteristics(product_id);
CREATE INDEX characteristics_reviews_reviews_id_index ON characteristics_reviews(review_id);

WITH mx AS ( SELECT MAX(id) AS id FROM public.characteristics_reviews)
SELECT setval('public.characteristics_reviews_id_seq', mx.id) AS curseq
FROM mx;

WITH mx AS ( SELECT MAX(id) AS id FROM public.reviews)
SELECT setval('public.reviews_id_seq', mx.id) AS curseq
FROM mx;

