/**
 * Created by davis on 3/22/15.
 */

/*
* Execute some code only if the given user is an admin.
* */
function ifAdmin(userId, callback) {
  if (Roles.userIsInRole(userId, 'admin'))
    callback && callback();
  else
    throw new Meteor.Error(403, 'Must be admin to execute.');
}

Meteor.methods({
  /**********************************
   *          Debug Methods         *
   **********************************/

  createUser: function(options, cb) {
    return Accounts.createUser(options)
  },

  /**********************************
   *       Assignment Methods       *
   **********************************/

  /*
   * Add a new assignment.
   * Params:
   *  Prospective assignment object.
   */
  addAssignment: function(a) {
    ifAdmin(Meteor.userId(), function() {
      if (Assignments.findOne({name: a.name}))
        throw new Meteor.Error(409, 'assignment with this name already exists.');
      else {
        Assignments.insert(a);
      }
    });
  },
  /*
   * Modify an assignment.
   * Params:
   *  Assignment id
   *  string with new assignment content
   */
  editAssignment: function(assignmentId, u) {
    ifAdmin(Meteor.userId(), function() {
      Assignments.update(assignmentId, {
        $push: {
          history: {
            content: u.content,
            date: new Date()
          }
        },
        $set: { gradeBreakdown: u.gradeBreakdown }
      });
    });
  },

  /*
   * Restore an old version of an assignment.
   * Params:
   *  Assignment id
   *  index of past version that will be pushed to the front.
   */
  restoreAssignment: function(assignmentId, indx) {
    /* we have to push to the end of the history when we edit,
    but when managing the history document it's easier with the most recent entry at the front, so we flip it. */
    ifAdmin(Meteor.userId(), function() {
      var h = Assignments.findOne(assignmentId).history.reverse();
      var updatedAssignment = {content: h[indx].content, date: new Date()};
      return Assignments.update(assignmentId, {$push: {history: updatedAssignment}});
    });
  },
  /*
   * Remove an assignment from the database.
   * Params:
   *  assignment id
   */
  delteAssignment: function(assignmentId) {
    ifAdmin(Meteor.userId(), function() {
      Assignments.remove(assignmentId);
    });
  },

  /**********************************
   *       Admin Page Methods       *
   **********************************/

  /*
   * Add a course.
   * Params: prospective course document.
   */
  addCourse: function(c) {
    ifAdmin(Meteor.userId(), function() {
      if (Courses.findOne({name: c.name}))
        throw new Meteor.Error(409, 'course with this name already exists.');
      else
        Courses.insert(c);
    });
  },

  /*
   * Remove a course from the database.
   * Params: course ID.
   */
  removeCourse: function(courseId) {
    ifAdmin(Meteor.userId(), function(){
      Courses.remove(courseId);
    });
  },

  /*
   * Add students to a course.
   * Params:
   *  course id
   *  array of students.
   */
  addStudentsToCourse: function(courseId, students) {
    ifAdmin(Meteor.userId(), function() {
      var d = [];
      for (var i = 0; i < students.length; i++) {
        d.push({username: students[i]});
      }
      Courses.update(courseId, {$addToSet: {students: {$each: d}}});
    });
  },

  /*
   * Pull a student from a course
   * Params:
   *  course id
   *  student name.
   */
  removeStudentFromCourse: function(courseId, student) {
    ifAdmin(Meteor.userId(), function() {
      Courses.update(courseId, {$pull: {students: {username: student}}});
    });
  },

  /*
   * Add an assignment to a course.
   * Params:
   *  course id
   *  assignment id
   */
  assignToCourse: function(courseId, assignmentId) {
    ifAdmin(Meteor.userId(), function() {
      Courses.update(courseId, {$addToSet: {assignments: assignmentId}});
    });
  },
  /*
   * Remove an assignment from a course's list.
   * Params:
   *  course id
   *  assignment id
   */
  unassignFromCourse: function(courseId, assignmentId) {
    ifAdmin(Meteor.userId(), function() {
      Courses.update(courseId, {$pull: {assignments: assignmentId}});
    });
  },

  /*
   * Update relevant fields when a user uploads a file.
   */
  uploadAssignment: function(assignmentInfo, fileInfo) {
    fileInfo.date = new Date(); // add the date to the fileInfo
    if (Meteor.userId()) {
      var s = Submissions.findOne({user: Meteor.userId(), assignment: assignmentInfo._id});
      // TODO: Allow user to view all their submissions in one place.
      fileInfo.timestamp = new Date();
      if (s) {
        Submissions.update(s._id, {$push: {files: fileInfo}});
      } else {
        Submissions.insert({
          user: Meteor.userId(),
          assignment: assignmentInfo._id,
          files: [fileInfo],
          grade: {score: null, comments: ""}
        });
      }
    } else {
      throw new Meteor.Error('403', 'Must be logged in to upload.');
    }
  },

  updateGrade: function(assignmentId, data) {
    ifAdmin(Meteor.userId(), function() {
      Submissions.update({assignment: assignmentId, user: Meteor.userId()}, {
        $set: {grade: data}
      });
    });
  },

  /*
   * "Tweet" out a message to all students enrolled in the course.
   * Params:
   *  course id
   *  "Tweet" content.
   */
  pushToFeed: function(courseId, content) {
    ifAdmin(Meteor.userId(), function() {
      if (content.length > 140) {
        throw new Meteor.Error('409', "exceeded character limit");
      } else {
        var u = {
          content: content,
          date: new Date(),
          author: Meteor.userId()
        };
        Courses.update(courseId, {$push: {feed: u}});
      }
    });
  },

  /*
   *
   */
  getFileData: function(path) {
    if (Meteor.isServer) {
      var fs = Npm.require('fs');
      
    }
  },

  /**********************************
   *       Lab Signup Methods       *
   **********************************/

   /*
    * Sign up for a new lab with the parameters as their respective pieces of info
    */
  addLab: function(data) {
    console.log(data)
    check(data, Match.ObjectIncluding({
      topic: String,
      start: Date,
      duration: Number,
      instructor: Match.Where(function(id) {
        return Meteor.users.findOne({ _id: id, "profile.roles": { $in: ["instructor"] } }) != null;
      }),
      comments: Match.Optional(String)
    }));
    var dataEnd = moment(data.start).add(data.duration, "m").toDate(),
        overlaps = Labs.aggregate([{
            $project: {
              end: { $add: ["$start", { $multiply: ["$duration", 60000] }] },
              start: 1, duration: 1, instructor: 1
          }}, {
            $match: {
                instructor: data.instructor,
                $or: [
                  { start: { $gte: data.start, $lt: dataEnd } },
                  { end: { $gte: data.start, $lt: dataEnd } }
                ]
          }}
        ]);

    console.log(overlaps)

    if(overlaps.length != 0)
      throw new Meteor.Error("409", "That instructor already has a lab scheduled for that time slot");

    return Labs.insert({
      topic: data.topic, start: data.start, duration: data.duration,
      instructor: data.instructor, comments: data.comments
    });
  }
});