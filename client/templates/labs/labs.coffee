Template.registerHelper "equals", (a, b) -> a == b

Session.setDefault "instructors", []
Session.setDefault "lab_err"

formItems = [
	required: true
	id: "lab-topic"
	type: "text"
,
	required: true
	id: "lab-start"
	type: "picker"
,
	required: true
	id: "lab-duration"
	type: "select"
	items: -> (i for i in [5..30] by 5)
,
	required: true
	id: "lab-instructor"
	type: "select"
	items: -> Session.get "instructors"
,
	required: false
	id: "lab-comments"
	type: "textarea"
]

Tracker.autorun ->
	Session.set "instructors", (user.profile.fullname for user in Meteor.users.find({"profile.roles": { $in: ["instructor"] }}).fetch())

Template.labs_form.helpers
	items: formItems
	toString: (item) ->
		JSON.stringify item
	checkLogged: ->
		if not Meteor.user()
			disabled: true
	err: ->
		console.log "err"
		s = Session.get "lab_err"
		console.log s
		if s?
			console.log s.message
		if s
			msg: s.message
	status: ->
		console.log "status"
		console.log Session.get "lab_err"
		if Session.get "lab_err"
			"has-error"
		else if Session.get "lab_success"
			"has-success"
		else
			""
	statusText: (status) ->
		switch status
			when "has-error" then "Please check for errors in the form"
			when "has-success" then "Successfully submitted!"
			else ""

Template.labs_item.helpers
	pretty: (id) ->
		(word[0].toUpperCase() + word[1..-1].toLowerCase() for word in id.replace("-", " ").split(" ")[1..-1]).join(" ")

Template.labs_form.rendered = ->
	$(".input-group.date").datetimepicker()

Template.labs_form.events
	"submit form": (evt, template) ->
		console.log "submit"
		evt.preventDefault()
		Meteor.call "addLab",
			_.object(_.map formItems, (item) ->
				[item.id[4..-1]].concat switch item.type
					when "text", "select", "textarea"
						val = template.find("#" + item.id).value
						switch item.id
							when "lab-duration" then parseInt(val)
							when "lab-instructor"
								id = Meteor.users.findOne({"profile.fullname": val, "profile.roles": { $in: ["instructor"] }})._id
								if id then id else throw new Meteor.Error(409, "Could not find instructor \"#{val}\"")
							else val
					when "picker"
						[$("#" + item.id).parent().data("DateTimePicker").date().toDate()]) #string interpolation doesn't work here
			(err, res) ->
				if err
					Session.set "lab_err", err
					Session.set "lab_success", false
				else
					Session.set "lab_err", undefined
					Session.set "lab_success", true