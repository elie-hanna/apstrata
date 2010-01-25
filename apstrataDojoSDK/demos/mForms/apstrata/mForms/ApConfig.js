
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

dojo.provide("apstrata.mForms.ApConfig")

if (!apstrata) apstrata = {}

/*
 * Put the proper credentials for your application here
 */

dojo.declare("apstrata.mForms.ApConfig", [], {
	config: {
		// ****************************************
		//
		// DO NOT COMMIT YOUR CREDENTIALS INTO SVN
		//
		// ****************************************
		key: 'apstrata1',//'T15613A768', //'Q6C6741B5E',
		secret: 'secret', //'Y7A120D8C1DFFA537D7E', //'YFB1E94CB62C5498FB7F',
		username: 'caroline1', //'caroline', //'rabih',
		password: '111111', //'111111', //'q1w2e3r4',
		serviceURL: 'http://localhost/apstratabase/rest', //'http://apsdb.apstrata.com/sandbox-apsdb/rest',
		defaultStore: 'DefaultStore',
		timeout: 10000	
	},
	
	get: function() {
		return this.config
	}
})


