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