/**
 * Created by davis on 3/16/15.
 */
Template.newAssignment.events({
  "submit .new-assignment": function(e) {
    e.preventDefault();
    var levels = e.target.levels.value.split(/, ?/);
    var url = e.target.name.value.toLowerCase().replace(/ /g, '-');
    if (Assignments.findOne({name: e.target.name.value})) {
      // don't create a new assignment, possibly send an error
    } else {
      Assignments.insert({
        name: e.target.name.value,
        url: url,
        content: e.target.text.value.trim(),
        levels: levels,
        dateCreated: new Date()
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
  'keydown textarea': function(e) {
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
});