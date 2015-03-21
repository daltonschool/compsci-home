/**
 * Created by davis on 3/16/15.
 */

Meteor.subscribe("assignments");
Meteor.subscribe("courses");

Session.setDefault("course", undefined);
Session.setDefault("edit", false);
Template.assignments.helpers({
  'assignments': function() {
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
  },
  'edit': function() {
    if (Roles.userIsInRole(Meteor.userId(), 'admin')) {
      return Session.get("edit");
    }
    return false;
  }
});
Template.assignments.events({
  'click #edit': function(e) {
    Session.set('edit', !Session.get('edit'));
  }
});
Template.adminAssignments.helpers({
  'assignments': function() {
    return Assignments.find({}, {sort: {rank: 1}});
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
    return Assignments.find({_id: {$nin: assigned}});
  },
  'assigned': function() {
    /*
     * Return all assignments that are in the assigned array.
     * We don't do the query like above because we need the order to stay the same.
     * That's why we build up the array object-by-object using findOne.
     */
    var a = Courses.findOne(Session.get("course")).assignments;
    var assigned = [];
    for (var i=0; i < a.length; i++)
      assigned[i] = Assignments.findOne(a[i]);
    return assigned;
  }
});
Template.adminPanel.events({
  "submit #addCourse": function(e) {
    e.preventDefault();
    if (Courses.findOne({name: e.target.courseName.value})) {

    } else {
      Courses.insert({
        name: e.target.courseName.value,
        students: [],
        assignments: [] // Array of objects with assignment ID and date assigned, for sorting.
      });
    }
    e.target.courseName.value = "";
    return false;
  },
  "submit #addStudents": function(e) {
    e.preventDefault();

    var students = e.target.students.value.split(/, ?/);
    var d = [];
    for (var i = 0; i < students.length; i++) {
      d.push({username: students[i]});
    }
    Courses.update(Session.get("course"), {$addToSet: {students: {$each: d}}})
    e.target.students.value = "";
    return false;
  },
  "click .remove": function(e) {
    Courses.remove(Courses.findOne({name: e.target.id})._id);
  },
  "click a.course": function(e) {
    Session.set("course", Courses.findOne({name: e.target.id})._id);
  },
  "click .del": function(e) {
    Courses.update(Session.get("course"), {$pull: {students: {username: e.target.id}}})
  },
  'click .assign': function(e) {
    Courses.update(Session.get("course"), {$addToSet: {assignments: e.target.id}});
  },
  'click .unassign': function(e) {
    Courses.update(Session.get('course'), {$pull: {assignments: e.target.id}});
  }
});

Template.adminAssignments.rendered = function() {
  this.$('#items').sortable({
    stop: function(e, ui) {
      // get the dragged html element and the one before
      //   and after it
      el = ui.item.get(0)
      before = ui.item.prev().get(0)
      after = ui.item.next().get(0)

      // Here is the part that blew my mind!
      //  Blaze.getData takes as a parameter an html element
      //    and will return the data context that was bound when
      //    that html element was rendered!
      if(!before) {
        //if it was dragged into the first position grab the
        // next element's data context and subtract one from the rank
        newRank = Blaze.getData(after).rank - 1
      } else if(!after) {
        //if it was dragged into the last position grab the
        //  previous element's data context and add one to the rank
        newRank = Blaze.getData(before).rank + 1
      }
      else
      //else take the average of the two ranks of the previous
      // and next elements
        newRank = (Blaze.getData(after).rank + Blaze.getData(before).rank)/2

      //update the dragged Item's rank
      Assignments.update({_id: Blaze.getData(el)._id}, {$set: {rank: newRank}})
    }
  })
};

Template.newAssignment.events({
  "submit .new-assignment": function(e) {
    e.preventDefault();
    var levels = e.target.levels.value.split(/, ?/);
    var url = e.target.name.value.toLowerCase().replace(/ /g, '-');
    if (Assignments.findOne({name: e.target.name.value})) {
      // don't create a new assignment, possibly send an error
    } else {
      var rank = -1;
      var a = Assignments.find({}, {sort: {rank: -1}}).fetch();
      if (a)
        rank = a.rank || 0;
      Assignments.insert({
        name: e.target.name.value,
        url: url,
        content: e.target.text.value.trim(),
        levels: levels,
        dateCreated: new Date(),
        rank: rank+1
      });
    }
    Router.go("/assignments/"+ url);
    return false;
  }
});

Template.editAssignment.helpers({
  "join": function(d) {
    return d.join(', ');
  },
  "trim": function(s) {
    return s.trim();
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

Template.editAssignment.events({
  'submit .edit-assignment': function(e) {
    var a = Assignments.findOne({name: e.target.name.value});
    Assignments.update(a._id, {
      $set: {content: e.target.text.value.trim(), levels: e.target.levels.value.split(/, /)}
    });
    Router.go("/assignments/"+ a.url);
    return false;
  },
  'click .delete': function(e) {
    Assignments.remove(e.target.id);
    Router.go("/assignments");
  },
  'keydown textarea': textareaTab
});

Template.newAssignment.events({
  'keydown textarea': textareaTab
});
