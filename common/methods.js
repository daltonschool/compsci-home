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

  /*
   **********************************
   *                                *
   *       Assignment Methods       *
   *                                *
   **********************************
   */

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
   *  object with fields to update.
   */
  editAssignment: function(assignmentId, d) {
    ifAdmin(Meteor.userId(), function() {
      if (d.name) {
        throw new Meteor.Error(403, 'you cannot change the name of an assignment.');
      } else {
        Assignments.update(assignmentId, {$set: d});
      }
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


  /*
   **********************************
   *                                *
   *       Admin Page Methods       *
   *                                *
   **********************************
   */

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
  }
});