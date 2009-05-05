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
dojo.provide("apstrata.dojo.tests.client.apsdb.ListStores");

dojo.require("apstrata.dojo.client.apsdb.ListStores");
dojo.require("apstrata.dojo.tests.Credentials");

dojo.declare("apstrata.dojo.tests.client.apsdb.ListStores",
[],
{
    execute: function() {
                var ls = new apstrata.dojo.client.apsdb.ListStores(apstrata.dojo.tests.Credentials.prototype.credentials);
                dojo.connect(ls, "handleResult", function(){
                    console.dir(ls.stores);
                })
                ls.execute();
            }
})