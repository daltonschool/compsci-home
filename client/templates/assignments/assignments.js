/**
 * Created by davis on 3/16/15.
 */

Meteor.subscribe("assignments");
Meteor.subscribe("courses");

Session.setDefault("course", undefined);
Session.setDefault("edit", false);
Session.setDefault("historyOffset", 0);

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

Template.newAssignment.events({
  "submit .new-assignment": function(e) {
    e.preventDefault();
    var url = e.target.name.value.toLowerCase().replace(/ /g, '-');

    Meteor.call('addAssignment', {
      name: e.target.name.value,
      url: url,
      history: [{content: e.target.text.value.trim(), date: new Date()}],
      dateCreated: new Date()
    }, function(err, result) {
      if (!err)
        Router.go("/assignments/"+url);
      else
        Router.go("/assignments");
    });
    return false;
  },
  'keydown textarea': textareaTab
});

Template.editAssignment.helpers({
  "join": function(d) {
    return d.join(', ');
  },
  "trim": function(s) {
    return s.trim();
  }
});

Template.editAssignment.events({
  'submit .edit-assignment': function(e) {
    var a =  Assignments.findOne({name: e.target.name.value}); // get the document of the assignment

    Meteor.call('editAssignment',a._id, e.target.text.value.trim(), function(err, result) {
      if (!err) {
        Router.go('/assignments/'+ a.url);
      }
    });
    return false;
  },
  'click .delete': function(e) {
    Meteor.call('deleteAssignment', e.target.id, function(err, result) {
      if (!err) {
        Router.go('/assignments');
      }
    });
  },
  'keydown textarea': textareaTab
});

Template.assignment.helpers({
  'getContent': function(h) {
    return h[Session.get("historyOffset")].content;
  },
  'dateFormat': function(d) {
    return d.toLocaleString();
  },
  'isOld': function() {
    return Session.get('historyOffset') != 0;
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