/**
 * Created by cforster on 3/17/15.
 */
Template.upload_s3.events({
  'click button.upload': function() {
    var assignmentInfo = {_id: this.assignment_id};
    var files = $("input.file_bag")[0].files;
    var dir = this.directory;

    S3.upload({
      files: files,
      path: dir,
      unique_name: !(dir == 'assets')
    }, function(err, result) {
      if (!err) {
        if (dir == 'assignments')
          Meteor.call('uploadAssignment', assignmentInfo, result);
        else if (dir == 'assets')
          Meteor.call('uploadAsset', result);
      }
    });
  }
});

Template.upload_s3.helpers({
  "files": function(){
    return S3.collection.find();
  }
});