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