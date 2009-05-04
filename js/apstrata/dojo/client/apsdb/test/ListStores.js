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
dojo.provide("apstrata.dojo.client.apsdb.test.ListStores");

dojo.require("apstrata.dojo.client.apsdb.ListStores");

dojo.declare("apstrata.dojo.client.apsdb.test.ListStores",
[],
{
    execute: function() {
        // Load credentials from auth.json
        dojo.xhrGet( {
            url: "auth.json",
            handleAs: "json",

            load: function(auth, ioArgs) {
                console.debug("using credentials loaded from auth.json:"); 
                console.dir(auth);

                // Execute apsdb operation
                var ls = new apstrata.dojo.client.apsdb.ListStores(auth);
                dojo.connect(ls, "handleResult", function(){
                    console.dir(ls.stores);
                })
                ls.execute();
                //ls.abort();
            }
        });        
    }
})