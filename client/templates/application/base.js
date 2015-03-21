/**
 * Created by davis on 3/17/15.
 */
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