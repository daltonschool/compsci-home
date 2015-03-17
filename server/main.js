/**
 * Created by davis on 3/17/15.
 */

Meteor.startup(function() {
  var u = Meteor.users.findOne({username: "davish"});
  if (u) {
    Roles.addUsersToRoles(u._id, 'admin');
  }
  var c = Meteor.users.findOne({username: "cforster"});
  if (c) {
    Roles.addUsersToRoles(c._id, 'admin');
  }
});