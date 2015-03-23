/**
 * Created by cforster on 3/17/15.
 */
var AssignmentFiles = new FS.Collection("assignmentfiles", {
    stores: [new FS.Store.FileSystem("images", {path: "~/assignmentfiles"})]
});