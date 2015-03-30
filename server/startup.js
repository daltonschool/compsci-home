/**
 * Created by davis on 3/17/15.
 */

Meteor.startup(function() {
  UploadServer.init({
    tmpDir: process.env.PWD + '/.uploads/tmp',
    uploadDir: process.env.PWD + '/.uploads',
    checkCreateDirectories: true,
    getDirectory: function(fileInfo, formData) {
      if (formData.type == 'assignment')
        return 'assignments';
      else
        return 'assets';
    },
    getFileName: function(fileInfo, formData) {
      var extension = '.'+fileInfo.name.split('.').pop();
      if (formData.type == 'assignment') {
        return Math.abs((fileInfo.name+ Date.now()).hashCode()).toString(16) +extension;
      } else {
        return fileInfo.name;
      }
    }
  });
});

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