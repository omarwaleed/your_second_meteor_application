Router.configure({
	layoutTemplate: 'main'
});

Todos = new Mongo.Collection('todos');
Lists = new Mongo.Collection('lists');

if(Meteor.isClient){
    Template.todos.helpers({
    	todo: function () {
    		var currentList = this._id;
    		var currentUser = Meteor.userId();
    		return Todos.find({listId: currentList, createdBy: currentUser }, {sort: {createdAt: -1}});
    	}
    });

    Template.todos.events({
    	'submit form': function (event) {
    		event.preventDefault();
    		//var todoName = event.target.todoName.value;  // Non-jQuery
    		// JQuery value capture
    		var todoName = $('[name="todoName"]').val();
    		var currentList = this._id;
    		var currentUser = Meteor.userId();
    		Todos.insert({
    			name: todoName,
    			completed: false,
    			createdAt: new Date(),
    			createdBy: currentUser,
    			listId: currentList
    		});
    		$('[name="todoName"]').val('');
    	}
    });

    Template.todoItem.events({
    	'click .delete-todo': function (event) {
    		event.preventDefault();
    		var documentId = this._id
    		// console.log(documentId);
    		var confirm = window.confirm("Delete this task?");
    		if (confirm) {
    			Todos.remove({_id: documentId});
    		}
    	},
    	'keyup [name=todoItem]': function(event){
    		if(event.which == 13 || event.which == 27){
    			$(event.target).blur();
    		}
    		else{
	    		var documentId = this._id
	    		var todoItem = $(event.target).val();
	    		Todos.update({_id: documentId}, {$set: {name: todoItem}});
	    		// console.log(event.which);
    		}
    	},
    	'change [type=checkbox]': function () {
    		var documentId = this._id;
    		var isCompleted = this.completed;
    		Todos.update({_id: documentId}, {$set: {completed: !isCompleted}});
    	}
    });

    Template.todoItem.helpers({
    	checked: function () {
    		var isCompleted = this.completed;
    		if (isCompleted) {
    			return "checked";
    		}
    		else
    		{
    			return "";
    		}
    	}
    });

    Template.todosCount.helpers({
    	'totalTodos': function(){
        var currentList = this._id;
        return Todos.find({ listId: currentList }).count();
	    },
	    'completedTodos': function(){
	        var currentList = this._id;
	        return Todos.find({ listId: currentList, completed: true }).count();
	    }
    });

    Template.addList.events({
    	'submit form': function (event) {
    		event.preventDefault();
    		var listName = $('[name=listName]').val();
    		var currentUser = Meteor.userId();
    		Lists.insert({name: listName, createdBy: currentUser}, function (error, results) {
    			Router.go('listPage', {_id: results});
    		});
    		$('[name=listName]').val('');
    	}
    });

    Template.lists.helpers({
    	list: function () {
    		var currentUser = Meteor.userId();
    		return Lists.find({createdBy: currentUser}, {sort: {name: 1}});
    	}
    });

    Template.register.events({
	    'submit form': function(event){
	        event.preventDefault();
	        var email = $('[name=email]').val();
	        var password = $('[name=password]').val();
		    Accounts.createUser({
	            email: email,
	            password: password
		    }, function (error) {
		    	if (error) {
	        		console.log(error.reason);
	        	}
	        	else
	        	{
	        		Router.go('home');
	        	}
		    });

		    Router.go('home');

	    }
	});

	Template.navigation.events({
	    'click .logout': function(event){
	        event.preventDefault();
	        Meteor.logout();
	        Router.go('login');
	    }
	});

	Template.login.events({
	    'submit form': function(event){
	        event.preventDefault();
	        var email = $('[name=email]').val();
	        var password = $('[name=password]').val();
	        Meteor.loginWithPassword(email, password, function (error) {
	        	if (error) {
	        		console.log(error.reason);
	        	}
	        	else
	        	{
                    // redirects to the same route you used to be on
                    // if the Router.go wasn't given
                    var currentRoute = Router.current().route.getName();
                    if (currentRoute == "login") {
	        		    Router.go('home');
                    }
	        	}
	        });
	    }
	});
}

if(Meteor.isServer){
    // server code goes here
}

Router.route('/register');

Router.route('/login');

Router.route('/',{
	name: 'home',
	template: 'home'
});

Router.route('/list/:_id', {
	name: 'listPage',
	template: 'listPage',
	data: function () {
		var currentList = this.params._id;
        var currentUser = Meteor.userId();
		return Lists.findOne({_id: currentList, createdBy: currentUser});
	},
    onRun: function(){
        console.log("You triggered 'onRun' for 'listPage' route.");
        this.next();
    },
    onRerun: function(){
        console.log("You triggered 'onRerun' for 'listPage' route.");
    },
    onBeforeAction: function() {
        var currentUser = Meteor.userId();
        if (currentUser) {
            // continues the route normally
            // if this function is called without a this.next
            // the route gets stuck
            this.next();
        }
        else {
            // render template instead
            this.render('login');
        }
    },
    onAfterAction: function(){
        console.log("You triggered 'onAfterAction' for 'listPage' route.");
    },
    onStop: function(){
        console.log("You triggered 'onStop' for 'listPage' route.");
    }
});