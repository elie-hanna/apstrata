/*******************************************************************************
 *  Copyright 2009 apstrata
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *
 *  You may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at: http://www.apache.org/licenses/LICENSE-2.0.html
 *  This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 *  CONDITIONS OF ANY KIND, either express or implied. See the License for the
 *  specific language governing permissions and limitations under the License.
 * *****************************************************************************
 */

dojo.provide("apstrata.dojoClient.util.ExecutionQueue");

//
// Executes operations sequentially.
// If one operation is unseccsful execution stops
//
dojo.declare("apstrata.dojoClient.util.ExecutionQueue",
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
