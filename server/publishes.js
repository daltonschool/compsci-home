/**
 * Created by davis on 3/20/15.
 */

Meteor.publish('assignments', function() {
  if (Roles.userIsInRole(this.userId, 'admin')) // if they're an admin, let 'em see everything.
    return Assignments.find({});
  else { // only show students assignments they've been assigned.
    if (Meteor.users.findOne(this.userId)) {
      var c = Courses.find({students: {username: Meteor.users.findOne(this.userId).username}}).fetch();
      var a = [];
      for (var i=0;i < c.length;i++) { // get *all* of the assignments that are relevant in one object
        a = a.concat(c[i].assignments);
      }
      return Assignments.find({_id: {$in: a}}); // return all of those objects without the submissions
    }
    else
      return [];
  }
});

Meteor.publish('submissions', function() {
  if (Roles.userIsInRole(this.userId, 'admin'))
    return Submissions.find({});
  else
    return Submissions.find({user: this.userId});
});

Meteor.publish('assets', function() {
  return SiteAssets.find({});
});

Meteor.publish('courses', function() {
  // only give access to course list if they're an admin.
  if (Roles.userIsInRole(this.userId, 'admin'))
    return Courses.find({});
  else {
    if (this.userId)
      return Courses.find({students: {username: Meteor.users.findOne(this.userId).username}});
    else
      return [];
  }
});

Meteor.publish("allUserData", function () {
  return Meteor.users.find({});
});