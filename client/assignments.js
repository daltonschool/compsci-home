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
    console.log("click!");
    e.preventDefault();
    //if (e.target.text.value !== '\n') // make sure there's still a space at the beginning.
    //  e.target.text.value = '\n'+e.target.text.value;
    var a = Assignments.findOne({name: e.target.name.value});
    console.log(a);
    Assignments.update(a._id, {
      $set: {content: e.target.text.value.trim()}
    });
    Router.go("/assignments/"+ a.url);
    return false;
  }
});