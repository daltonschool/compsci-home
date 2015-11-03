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
    this.render("assignmentEditor", {
      data: function() {
        return {oldDoc: false, t: "! New Assignment"}
      }
    });
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
          dueDate: a.dueDate,
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
    a.oldDoc = true;
    a.t = "! Edit Assignment";
    if (a) {
      this.render("assignmentEditor", {
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
            assignment: a._id,
            breakdown: a.gradeBreakdown
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

Router.route("/labs", function() {
  this.render('youcanbookme');
});

Router.route("/submissions/assignments/:filename", function() {
  downloadFile(process.env.PWD + "/.uploads/assignments/" + this.params.filename, this.params.filename, this.response);
}, {where: 'server'});

Router.route("/assets/:filename", function() {
  downloadFile(process.env.PWD + "/.uploads/assets/" + this.params.filename, this.params.filename, this.response);
}, {where: 'server'});

function downloadFile(path, filename, res) {
  var fs = Npm.require('fs');
  var file = path;
  var stat = null;
  var extension = filename.split('.').pop();
  try {
    stat = fs.statSync(file);
  } catch (_error) {
    this.response.statusCode = 404;
    this.response.end(filename + " does not exist. sorry!");
    return;
  }
  var attachmentFilename = filename;
  // Set the headers
  res.writeHead(200, {
    'Content-Type': 'application/'+extension,
    'Content-Disposition': 'attachment; filename=' + attachmentFilename,
    'Content-Length': stat.size
  });
  fs.createReadStream(file).pipe(res);
}

Router.route("/", function() {
  this.render("home");
});
