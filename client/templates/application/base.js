/**
 * Created by davis on 3/17/15.
 */

Session.setDefault('warnings', '');

Accounts.ui.config({
  passwordSignupFields: "USERNAME_ONLY"
});

Handlebars.registerHelper("title", function(title) {
  if(title) {
    document.title = title + ' | dCS';
  } else {
    document.title = "dCS";
  }
});

Template.login.helpers({
  warnings: function() {
    return Session.get('warnings');
  }
});
Template.login.events({
  "submit .loginForm": function(e) { // custom login form
    e.preventDefault();
    var username = e.target.username.value;
    var password = e.target.password.value;
    Meteor.loginWithDalton(username, password, function(error) {
      if (error) {
        Session.set("warnings", "Invalid Username or Password.");
      } else {
        Session.set("warnings", "");
      }
    });
    return false;
  }
});