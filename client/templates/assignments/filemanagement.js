/**
 * Created by cforster on 3/17/15.
 */
Template.assignment.helpers({
    assignmentSubmit: function() {
        var assignmentInfo = this;
        return {
            finished: function (index, fileInfo, context) {
                Meteor.call('uploadAssignment', assignmentInfo, fileInfo);
            }
        }
    },
    assignmentData: function() {
        return {type: 'assignment'};
    }
});

Template.upload_s3.events({
  'click button.upload': function() {
    var assignmentInfo = {_id: this.assignment_id};
    console.log(this.assignment_id);
    var files = $("input.file_bag")[0].files;
    S3.upload({files: files, path: this.directory}, function(err, result) {
      if (!err) {
        console.log(result);
        Meteor.call('uploadAssignment', assignmentInfo, result);
      }
    });
  }
});

Template.upload_s3.helpers({
  "files": function(){
    return S3.collection.find();
  }
});