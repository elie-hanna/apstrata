dojo.provide("apstrata.apsdb.util.ExecutionQueue");

//
// Executes operations sequentially.
// If one operation is unseccsful execution stops
//
dojo.declare("apstrata.apsdb.util.ExecutionQueue",
[],
{
    top: null,
    topEvent: null,
    
    run: function() {console.debug("nothing to execute, queue empty!")},	// In case nothing has been queued to get an error message
    
    queue: function(operation, finishRunEvent, runCommand) {
	if (this.top == null) {
	    this.top = operation;
	    this.topEvent = finishRunEvent;
	    
	    // The first operation queued is the 1st operation to call for the sequential queue execution to happen
	    this.run = runCommand;
	} else {
	    // Hook the current operation runCommand to the 'finish' event of the previous one so it gets called immediately
	    // after the 1st one executes succesfully
	    var handle = dojo.connect(this.top, this.topEvent, function(){
		// Removes the queue hook after the event fires so the queue doesn't get invoked,
		// in case that operation is executed in the future
		dojo.disconnect(handle);		
		runCommand();
	    })
	    
	    this.top = operation;
	    this.topEvent = finishRunEvent;
	}
    }
});

/*
 function qh() {
    init: function() {
	this.q = new apstrata.apsdb.util.ExecutionQueue();
    },
    
    push: function(context, params) {
	q.queue(context, "handleResult", function() {context.execute()});
    },
    
    run: function run() {
	q.run();
    }
}

qh.init();
q.push(ls);
q.push(cs, "store1");
q.push(ls);
q.run();

*/