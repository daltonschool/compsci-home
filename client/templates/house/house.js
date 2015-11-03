/**
 * Created by davis on 3/28/15.
 */
Meteor.subscribe("submissions");

Template.house.helpers({
  submission: function() {
    // very similar to "submission()" in assignments.js, but we're finding all assignments for a student,
    // instead of all students for an assignment.
    var subs = [];
    var classes = Courses.find({students: {username: Meteor.user().username}}).fetch();
    for (var i = 0; i < classes.length; i++) { // for each class the student is enrolled in,
      var assts = classes[i].assignments; // find the assignments for that class.
      for (var j = 0; j < assts.length; j++) { // for each assignment,
        var sub = Submissions.findOne({ // find their latest submission for that assignment.
            assignment: assts[j], username: Meteor.user().username},
          {sort: [["timestamp", "desc"]]}
        );
        if (sub)
          subs.push(sub); // add it to the array if it exists.
      }
    }

    return subs;
  },
  getName: function(a) {
    return Assignments.findOne(a).name;
  },
  getAsstUrl: function(a) {
    return Assignments.findOne(a).url;
  },
  hasBeenGraded: function(g) {
    return g.score !== null;
  }
});