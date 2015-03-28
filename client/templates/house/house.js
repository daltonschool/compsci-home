/**
 * Created by davis on 3/28/15.
 */
Meteor.subscribe("submissions");

Template.house.helpers({
  submission: function() {
    return Submissions.find({user: Meteor.userId()});
  },
  getName: function(a) {
    return Assignments.findOne(a).name;
  }
});