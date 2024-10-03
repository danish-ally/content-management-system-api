
const redis = require('../config/redisConfig')
const deleteCourseCache = (patterns) => {
    const pattern = `${patterns}*`;
  
    const deleteKeys = (cursor, callback) => {
        redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100, (err, reply) => {
        if (err) {
          console.error('Error scanning keys:', err);
          return callback(err);
        }
  
        const [newCursor, keys] = reply;
  
        if (keys.length > 0) {
            redis.del(keys, (delErr) => {
            if (delErr) {
              console.error('Error deleting keys:', delErr);
              return callback(delErr);
            }
          });
        }
  
        if (newCursor === '0') {
          return callback(null); // Done scanning
        } else {
          deleteKeys(newCursor, callback); // Continue scanning
        }
      });
    };
  
    deleteKeys('0', (err) => {
      if (err) {
        console.error('Failed to delete course cache:', err);
      } else {
        console.log('Course cache cleared successfully.');
      }
    });
  };


module.exports = deleteCourseCache;
  
  
  