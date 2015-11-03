/**
 * Created by davis on 3/28/15.
 */
Meteor.subscribe("submissions");

Template.house.onRendered(function() {
  var uname = this.data.u;
  Session.set('zoom', undefined);
  Session.set('username', uname);
});

Template.house.helpers({
  submission: function() {
    var uname = Session.get('username');
    // very similar to "submission()" in assignments.js, but we're finding all assignments for a student,
    // instead of all students for an assignment.
    var subs = [];
    var classes = Courses.find({students: {username: uname}}).fetch();
    for (var i = 0; i < classes.length; i++) { // for each class the student is enrolled in,
      var assts = classes[i].assignments; // find the assignments for that class.
      for (var j = 0; j < assts.length; j++) { // for each assignment,
        var sub = Submissions.findOne({ // find their latest submission for that assignment.
            assignment: assts[j], username: uname},
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
  },
  u: function() {
    if (this.u)
      return Meteor.users.findOne({username: this.u});
    else
      return Meteor.user();
  },
  zoom: function() {
    return Session.get('zoom');
  },
  equal: function(a, b) {
    return a == b;
  }
});

Template.house.events({
  'click .zoom': function(e) {
    if (Blaze.getData(e.target).assignment == Session.get('zoom'))
      Session.set('zoom', undefined);
    else
      Session.set('zoom', Blaze.getData(e.target).assignment);
  },
  'click #unzoom': function() {
    Session.set('zoom', undefined);
  }
});

Template.submissionHistory.helpers({
  submissions: function() {
    var uname = Session.get('username');
    var assn = this.assignment_id;
    return Submissions.find({assignment: assn, username: uname}, {sort: [["timestamp", "desc"]]});
  },
  hasBeenGraded: function(g) {
    return g.score !== null;
  },
  localeString: function(d) {
    return d.toLocaleString();
  }
});