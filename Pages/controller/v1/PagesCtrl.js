const Pages = require("../../models/pageSchema");
const redis = require('../../../common/config/redisConfig');
const deleteCourseCache = require('../../../common/utils/deleteRedisKey')

const addPageData = async (req, res) => {
    try {
      const PageNameExist = await Pages.findOne({
        name: req.body.name,
      });
  
      if ( PageNameExist) {
        return res.status(409).json({
          error: true,
          message: "Page with this name already exist ",
        });
      }

  
      await new Pages(req.body).save();
      deleteCourseCache('courses')
      deleteCourseCache(`courseDetail`)
      deleteCourseCache(`modules`)
      deleteCourseCache(`topic`)
      deleteCourseCache(`page`)
      deleteCourseCache(`questions`)
      res
        .status(200)
        .json({ error: false, message: "Page added Successfully" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: true, message: "Internal Server Error" });
    }
  };


  const editPageData = async (req, res) => {
    try {
      const { content } = req.body;
      const pageId = req.params.pageId; // Extracting ID from the URL path
  
      // Check if the application with the given ID exists
      const existingAPage = await Pages.findById(pageId);
      if (!existingAPage) {
        return res.status(404).json({
          error: true,
          message: "Page with this ID does not exist",
        });
      }
  
      

      // Update the application with the new data
      existingAPage.name = existingAPage.name;
      existingAPage.content = content || existingAPage.content;
  
      await existingAPage.save();
      deleteCourseCache('page')
      deleteCourseCache('courses')
      deleteCourseCache(`courseDetail`)
      deleteCourseCache(`modules`)
      deleteCourseCache(`topic`)
      deleteCourseCache(`questions`)
      res
        .status(200)
        .json({ error: false, message: "Page updated successfully" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: true, message: "Internal Server Error" });
    }
  };


  const getPageList = async (req, res) => {
    try {
      const result = await Pages.find(
        { status: { $ne: "Deleted" } }
      );
  
      res.status(200).json({
        error: false,
        result: result,
        message: "got all Pages details",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: true, message: "Internal Server Error" });
    }
  };


  const getPageDetailsByUrlmask = async (req, res) => {
    const urlMask = req.params.urlMask;
  
    try {
      const cacheKey = `page:${urlMask}`;
  
      redis.get(cacheKey, async (err, cachedData) => {
        if (err) {
          return res.status(500).json({
            error: true,
            message: "Redis error",
            details: err.message,
          });
        }
  
        if (cachedData) {
          return res.status(200).json(JSON.parse(cachedData));
        } else {
          const page = await Pages.findOne({ urlMask });
  
          if (!page) {
            return res.status(404).json({
              error: true,
              message: "Page not found",
            });
          }
  
          const result = {
            error: false,
            result: page,
            message: "Got page details",
          };
  
          redis.set(cacheKey, JSON.stringify(result));
  
          return res.status(200).json(result);
        }
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: true,
        message: "Internal Server Error",
      });
    }
  };
  


  module.exports = {
    editPageData,
    addPageData,
    getPageList,
    getPageDetailsByUrlmask,
  };