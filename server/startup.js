/**
 * Created by davis on 3/17/15.
 */

Meteor.startup(function() {
  var u = Meteor.users.findOne({username: "c17dh"});
  if (u) {
    Roles.addUsersToRoles(u._id, 'admin');
  }
  var c = Meteor.users.findOne({username: "cforster"});
  if (c) {
    Roles.addUsersToRoles(c._id, 'admin');
  }

  UploadServer.init({
    tmpDir: process.env.PWD + '/.uploads/tmp',
    uploadDir: process.env.PWD + '/public',
    checkCreateDirectories: true
  });
});