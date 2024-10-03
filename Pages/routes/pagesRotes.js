const PageRoutes = require("express").Router();
const pagesCtrl = require('../controller/v1/PagesCtrl');




PageRoutes.post("/addPage", pagesCtrl.addPageData);
PageRoutes.put("/editPage/:pageId", pagesCtrl.editPageData);
PageRoutes.get("/getpagelist", pagesCtrl.getPageList);
PageRoutes.get("/getpagedetails/:urlMask", pagesCtrl.getPageDetailsByUrlmask);


module.exports = PageRoutes;