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

Router.route("/assignments/new", function() {
  if (Roles.userIsInRole(Meteor.userId(), 'admin'))
    this.render("newAssignment");
  else
    this.redirect("/assignments");
});

Router.route("/assignments/:url", function() {
  var a = Assignments.findOne({url: this.params.url});
  if (a) {
    a.history = a.history.reverse();
    for (var i=0;i< a.history.length;i++)
      a.history[i].indx = i;
    this.render("assignment", {
      data: function() {
        return {
          name: a.name,
          content: a.history[a.history.length-1].content,
          history: a.history,
          url: a.url,
          _id: a._id
        };
      }
    });
  } else {
    this.redirect('/assignments')
  }
});

Router.route("/assignments/:url/edit", function() {
  if (Roles.userIsInRole(Meteor.userId(), 'admin')) {
    var a = Assignments.findOne({url: this.params.url});
    if (a) {
      this.render("editAssignment", {
        data: function() {
          return a;
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

Router.route("/assignments/:url/submissions", function() {
  if(Roles.userIsInRole(Meteor.userId(), 'admin')) {
    var a = Assignments.findOne({url: this.params.url});
    if (a) {
      this.render("assignmentSubmissions", {
        data: function () {
          return {
            submission: Submissions.find({assignment: a._id}),
            assignment: a._id
          }
        }
      });
    } else {
      this.redirect('/assignments');
    }
  } else {
    this.redirect('/assignments/'+this.params.url);
  }
});

Router.route("/assignments", function() {
  this.render("assignments");
});

Router.route("/house", function() {
  this.render('house');
});

Router.route("/", function() {
  this.render("home");
});
