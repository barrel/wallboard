var moment = require('moment');

module.exports = {
  date: function(context, format) {
    var f = !format.hash ? format : "MMMM Do, YYYY";
    return moment(context).format(f);
  },
  lowercase: function(str) {
    if(str && typeof str === "string") {
      return str.toLowerCase();
    }
  }
}