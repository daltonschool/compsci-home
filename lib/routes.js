/**
 * Created by davis on 3/16/15.
 */

Router.configure({
    layoutTemplate: 'layout'
});

Router.route("/assignments/admin", function() {
  if (Meteor.userId()) {
    if (Meteor.users.findOne(Meteor.userId()).roles.indexOf("admin") > -1) {
      this.render("adminPanel");
    } else {
      this.redirect("/assignments");
    }
  }
  else {
    this.redirect("/assignments");
  }
});

Router.route("/assignments/edit/:url", function() {
  if (Roles.userIsInRole(Meteor.userId(), 'admin')) {
    this.render("editAssignment", {
      data: function () {
        return Assignments.findOne({url: this.params.url});
      }
    });
  }
  else {
    this.redirect("/assignments");
  }
});

Router.route("/assignments/new", function() {
  if (Roles.userIsInRole(Meteor.userId(), 'admin'))
    this.render("newAssignment");
  else
    this.redirect("/assignments");
});
Router.route("/assignments/:name", function() {
  this.render("assignment", {
    data: function() {
      return Assignments.findOne({url: this.params.name});
    }
  });
});

Router.route("/assignments", function() {
  this.render("assignments");
});

Router.route("/", function() {
  this.render("home");
});
