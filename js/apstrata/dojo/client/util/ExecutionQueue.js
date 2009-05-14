/*******************************************************************************
 *  Copyright 2009 Apstrata
 *  
 *  This file is part of Apstrata Database Javascript Client.
 *  
 *  Apstrata Database Javascript Client is free software: you can redistribute it
 *  and/or modify it under the terms of the GNU Lesser General Public License as
 *  published by the Free Software Foundation, either version 3 of the License,
 *  or (at your option) any later version.
 *  
 *  Apstrata Database Javascript Client is distributed in the hope that it will be
 *  useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Lesser General Public License for more details.
 *  
 *  You should have received a copy of the GNU Lesser General Public License
 *  along with Apstrata Database Javascript Client.  If not, see <http://www.gnu.org/licenses/>.
 * *****************************************************************************
 */

dojo.provide("apstrata.dojo.client.util.ExecutionQueue");

//
// Executes operations sequentially.
// If one operation is unseccsful execution stops
//
dojo.declare("apstrata.dojo.client.util.ExecutionQueue",
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
