/**
 * Created by davis on 3/16/15.
 */

Meteor.subscribe("assignments");
Meteor.subscribe("courses");
Meteor.subscribe("submissions");
Meteor.subscribe("assets");
Meteor.subscribe("allUserData");

Session.setDefault("course", undefined);
Session.setDefault("edit", false);
Session.setDefault("historyOffset", 0);
Session.setDefault('submissionInfo', undefined);

Template.assignments.helpers({
  'assignments': function() {
    if (Roles.userIsInRole(Meteor.userId(), 'admin')) { // just spit it all out if it's an admin.
      return Assignments.find({}, {sort: {dateCreated: 1}});
    } else {
      var c = Courses.find().fetch();
      var inThere = {};
      var assnmnts = [];
      for (var i=0;i< c.length;i++) {
        for (var j=0;j<c[i].assignments.length;j++){
          if (!inThere[c[i].assignments[j]]) {
            assnmnts.push(Assignments.findOne(c[i].assignments[j]))
            inThere[c[i].assignments[j]] = true;
          }
        }
      }

      return assnmnts;
    }
  },
  update: function() {
    var c = Courses.find().fetch();
    var m = _.max(c, function (n) {
      return n.feed.length;
    });
    var f = [];
    for (var i = 0; i < m.feed.length; i++) {
      for (var j = 0; j < c.length; j++) {
        if (c[j].feed.length >= i) {
          c[j].feed[i].course = c[j].name;
          f.push(c[j].feed[i]);
        }
      }
    }
    return f.reverse();
  },
  fullname: function(id) {
    return Meteor.users.findOne(id).profile.fullname;
  },
  format: function(d) {
    return d.toLocaleString();
  }
});

Template.adminPanel.helpers({
  'courses': function() {
    return Courses.find({});
  },
  'course': function() {
    if (Session.get("course"))
      return Courses.findOne(Session.get("course")).name || '';
    else
      return '';
  },
  'students': function() {
    return Courses.findOne(Session.get("course")).students;
  },
  'unassigned': function() {
    /*
     * Return all assignments whose IDs are not in the array of assigned assignments.
     */
    var assigned = Courses.findOne(Session.get("course")).assignments;
    return Assignments.find({_id: {$nin: assigned}}, {sort: {dateCreated: 1}});
  },
  'assigned': function() {
    /*
     * Return all assignments that are in the assigned array.
     * We don't do the query like above because we need the order to stay the same.
     * That's why we build up the array object-by-object using findOne.
     */
    var a = Courses.findOne(Session.get("course")).assignments;
    var assigned = [];
    for (var i=0; i < a.length; i++) {
      if(Assignments.findOne(a[i])) // if the assignment hasn't been deleted
        assigned.push(Assignments.findOne(a[i]));
    }
    return assigned;
  },
  'update': function() {
    var f = Courses.findOne(Session.get('course')).feed.reverse();
    return f.slice(0,5); // only return 5 most recent updates.
  }
});

Template.adminPanel.events({
  "submit #addCourse": function(e) {
    e.preventDefault();
    Meteor.call('addCourse', {
      name: e.target.courseName.value,
      students: [],
      assignments: [] // Array of objects with assignment ID and date assigned, for sorting.
    });
    e.target.courseName.value = "";
    return false;
  },
  "submit #addStudents": function(e) {
    e.preventDefault();
    var students = e.target.students.value.split(/, ?/);
    Meteor.call('addStudentsToCourse', Session.get('course'), students);
    e.target.students.value = "";
    return false;
  },
  "submit #feed": function(e) {
    Meteor.call('pushToFeed', Session.get('course'), e.target.content.value);
    return false;
  },
  // remove a course from the database
  "click .remove": function(e) {
    Meteor.call('removeCourse', Courses.findOne({name: e.target.id})._id);
  },
  "click a.course": function(e) {
    Session.set("course", Courses.findOne({name: e.target.id})._id);
  },
  "click .del": function(e) {
    Meteor.call('removeStudentFromCourse', Session.get('course'), e.target.id);
  },
  'click .assign': function(e) {
    Meteor.call('assignToCourse', Session.get('course'), e.target.id);
  },
  'click .unassign': function(e) {
    Meteor.call('unassignFromCourse', Session.get("course"), e.target.id);
  }
});

Template.assignmentEditor.onRendered(function() {
  this.$('.datetimepicker').datetimepicker();
});

Template.assignmentEditor.events({
  'submit .editor': function(e) {
    var assignment = {
      name: e.target.name.value,
      content: e.target.text.value.trim(),
      dueDate: new Date(e.target.dueDate.value),
      gradeBreakdown: {
        points: e.target.startingPoints.value
      }
    };

    Meteor.call('addOrUpdateAssignment', assignment, function(err, result) {
      console.log(result);
      if (!err) {
        Router.go('/assignments/');
      }
    });
    return false;
  },
  'click .delete': function(e) {
    Meteor.call('deleteAssignment', this._id, function(err, result) {
      if (!err) {
        Router.go('/assignments');
      }
    });
  },
  'keydown textarea': textareaTab
});

Template.assignmentEditor.helpers({
  content: function() {
    return this.history[this.history.length-1].content;
  },
  files: function() {
    return SiteAssets.find({});
  },
  isoString: function(d) {
    return d.toLocaleString();
  }
});

function textareaTab(e) {
  var keyCode = e.keyCode || e.which;
  if (keyCode == 9) {
    e.preventDefault();
    var start = e.target.selectionStart;
    var end = e.target.selectionEnd;
    // set textarea value to: text before caret + tab + text after caret
    e.target.value = e.target.value.substring(0, start)
    + '\t'
    + e.target.value.substring(end);
    // put caret at right position again
    e.target.selectionStart =
      e.target.selectionEnd = start + 1;
  }
}

Template.assignment.helpers({
  'getContent': function(h) {
    return h[Session.get("historyOffset")].content;
  },
  'dateFormat': function(d) {
    return d.toLocaleString();
  },
  'isOld': function() {
    return Session.get('historyOffset') != 0;
  },
  'assignmentOpen': function() {
    return this.dueDate > new Date();
  },
  isoString: function(d) {
    return d.toLocaleString();
  }
});

Template.assignment.events({
  'change .history': function(e) {
    var newIndx = $(e.target).val();
    Session.set('historyOffset', newIndx);
  },
  'click .restore': function(e) {
    Meteor.call('restoreAssignment', this._id, Session.get('historyOffset'), function(err, result) {
      if (!err) {
        Session.set('historyOffset', 0);
        $('.history :nth-child(0)').prop('selected', true);
      }
    });
  }
});

Template.assignment.onRendered(function() {
  // make sure that you're always seeing the most recent document.
  Session.set('historyOffset', 0);
});

Template.assignmentSubmissions.helpers({
  userInfo: function(id, field) {
    var u = Meteor.users.findOne(id);
    if (u[field])
      return u[field];
    else
      return u.profile[field];
  },
  userNameInfo: function(name, field) {
    var u = Meteor.users.findOne({username: name});
    if (u[field])
      return u[field];
    else
      return u.profile[field];
  },
  submission: function() {
    var classes = Courses.find({assignments: this.assignment_id}).fetch();
    var assignment_id = this.assignment_id;
    var subs = []; // each entry is a dictionary with username, a course ID and a 'submission' object.
    // This can be null if user hasn't submitted.
    for (var i = 0; i < classes.length; i++) { // for every class that uses this assignment:
      var studs = classes[i].students;
      for (var j = 0; j < studs.length; j++) { // for every student in that class:
        var student_name = studs[j].username;

        // this is the entry for the `subs` array that is eventually returned
        var sub = {"username": student_name, "course": classes[i]._id, 'submission': null};
        // find the most recent submission from that student, sorted by "timestamp" descending.
        var s = Submissions.findOne({
          "assignment": assignment_id, "username": student_name
        }, {sort: [["timestamp", "desc"]]});

        if (s)
          sub['submission'] = s; // if that returned something, attach it to the object.
        subs.push(sub);
      }
    }
    //console.log(subs);
    return subs;
  },
  submissionInfo: function() {
    return Session.get('submissionInfo').submission;
  },
  mostRecentSubmission: function() {
    var s = Session.get('submissionInfo').submission;
    if (s) {
      // computationally, would be better to do s.pop(), but I'm not sure if object is mutable.
      return s.files[s.files.length-1];
    }
  },
  score: function() {
    if (Session.get('score') !== undefined)
      return parseInt(this.breakdown.points) + Session.get('score') + Session.get('bonus');
    else
      return Session.get('submissionInfo').grade.score;
  }
});

Template.assignmentSubmissions.events({
  'click button.student': function(e) {
    /* get the data that was used to render that button, which is
     * the element of the submissions array corresponding to the student's submission for that assignment.
     */
    Session.set('submissionInfo', Blaze.getData(e.target));
  },
  'submit #grading': function(e) {
    e.preventDefault();
    Meteor.call('updateGrade', this.assignment_id, {
      score: e.target.percent.value,
      comments: e.target.comments.value,
      timestamp: new Date()
    });

    Session.set('submissionInfo', undefined);

    return false;
  },
  'keyup #comments': function(e) {
    var score = 0;
    var bonus = 0;
    var r = /[\-\+]([0-9]+)/g;
    var matches = e.target.value.match(r) || [];
    for (var i=0;i<matches.length;i++) {
      var num = Number(matches[i].slice(1));
      if (matches[i].charAt(0) == '-')
        score -= num;
      else if (matches[i].charAt(0) == '+')
        bonus += num;
    }
    Session.set("score", score);
    Session.set("bonus", bonus)
  },
  'keydown textarea': textareaTab
});
