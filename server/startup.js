/**
 * Created by davis on 3/17/15.
 */
S3.config = {
  key: process.env.S3_KEY,
  secret: process.env.S3_SECRET,
  bucket: 'dcshome'
};

/*
 * http://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery
 */
String.prototype.hashCode = function() {
  var hash = 0, i, chr, len;
  if (this.length == 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};