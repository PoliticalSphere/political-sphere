// Compatibility shim: tests import `newsService.js` (camelCase) while
// implementation file is `news-service.js`. Re-export the class here so both
// import styles work.
import { NewsService } from "./news-service.js";
export { NewsService };

export default NewsService;
