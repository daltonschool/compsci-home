/**
 * Created by cforster on 3/17/15.
 */
Template.assignment.helpers({
    assignmentSubmit: function() {
        return {
            finished: function (index, fileInfo, context) {
                console.log(fileInfo);
                //TODO: associate fileInfo.name with a user and an assignment
            }
        }
    }
});