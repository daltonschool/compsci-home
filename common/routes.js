/**
 * Created by davis on 3/16/15.
 */

Router.configure({
    layoutTemplate: 'layout'
});

Router.route("/assignments/admin", function() {
  // weird workaround for it not recognizing admin
  if (Meteor.userId()) {
    if (Roles.userIsInRole(Meteor.userId(), 'admin')) {
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
    var a = Assignments.findOne({url: this.params.url});
    if (a) {
      this.render("editAssignment", {
        data: function() {
          return {
            name: a.name,
            content: a.history[a.history.length-1].content,
            url: a.url
          };
        }
      });
    } else {
      this.redirect('/assignments')
    }
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

Router.route("/assignments/:url", function() {
  var a = Assignments.findOne({url: this.params.url});
  if (a) {
    this.render("assignment", {
      data: function() {
        return {
          name: a.name,
          content: a.history[a.history.length-1].content,
          url: a.url
        };
      }
    });
  } else {
    this.redirect('/assignments')
  }
});

Router.route("/assignments", function() {
  this.render("assignments");
});

Router.route("/", function() {
  this.render("home");
});
