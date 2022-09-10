import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    constant_request_rate: {
      executor: 'constant-arrival-rate',
      rate: 1000,
      timeUnit: '1s', // 1000 iterations per second, i.e. 1000 RPS
      duration: '60s',
      preAllocatedVUs: 100, // how large the initial pool of VUs would be
      maxVUs: 10000, // if the preAllocatedVUs are not enough, we can initialize more
    },
  },
};

export default function () {
  let getReviews = http.get('http://localhost:8000/reviews?product_id=1')
  check(getReviews, {'Get reviews reponds with status code of 200': (r) => r.status == 200})
  let getMetaData = http.get('http://localhost:8000/reviews/meta?product_id=1')
  check(getMetaData, {'Get meta data reponds with status code of 200': (r) => r.status == 200})
  // sleep(0.5);
}
