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
        content: '\n'+ e.target.text.value,
        levels: levels,
        dateCreated: new Date()
      });
    }
    Router.go("/assignments/"+ url);
    return false;
  }
});
Template.newAssignment.helpers({
  "title": function() {
    return "New Assignment"
  }
});