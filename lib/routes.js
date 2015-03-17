/**
 * Created by davis on 3/16/15.
 */

Router.configure({
    layoutTemplate: 'layout'
});

Router.route("/assignments/edit/:url", function() {
  this.render("editAssignment", {
    data: function() {
      return Assignments.findOne({url: this.params.url});
    }
  });
});

Router.route("/assignments/new", function() {
  this.render("newAssignment");
});
Router.route("/assignments/:name", function() {
  this.render("assignment", {
    data: function() {
      return Assignments.findOne({url: this.params.name});
    }
  });
});

Router.route("/assignments", function() {
  this.render("assignments", {data: {assignments: Assignments.find().fetch()}});
});

Router.route("/", function() {
  this.render("home");
});



