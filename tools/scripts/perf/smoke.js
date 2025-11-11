/* global __ENV */
import { sleep } from "k6";
import http from "k6/http";

export const options = {
  vus: 1,
  iterations: 10,
};

const BASE = __ENV.PERF_BASE_URL || "http://localhost:3000";

export default function () {
  http.get(BASE);
  sleep(0.2);
}
