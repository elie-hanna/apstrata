#!/bin/bash

basePath=../../../../..
basePath=`readlink -f $basePath`

# This should be located in your dojo/util/buildscripts folder
# You must have the dojo build profile template file: /profiles/apstratacms.template.profile
# delete the old release folder
echo "deleting the old dojo release folder"
rm -rf $basePath/lib/dojo/release/

# clear out any old tmp/output files that might still be here
echo "removing apstratacms.build.tmp files"
rm -f $basePath/lib/dojo/util/buildscripts/apstratacms.build.tmp.prefix.*
rm -f $basePath/lib/dojo/util/buildscripts/apstratacms.build.tmp.suffix.*
rm -f $basePath/lib/dojo/util/buildscripts/apstratacms.build.tmp.sorted

# grep out all the dojo.require() statements from the project
#	remove everything except the class names
#	remove the unwanted fieldDef.field.widget line.
#	sort + uniq
#	remove white spaces + blank lines
#	add commas
#	save to apstratacms.build.tmp.sorted
#deps=`grep -rh --exclude=.svn dojo.require ../../../../../components/elementn/ | sed 's/^\s*//g' | sed 's/\s*$//g' | sed 's/dojo.require(//g' | sed 's/).*$//g' | sed '/fieldDef.field.widget.type/d' | sort | uniq | sed '/^$/d' | sed 's/$/,/g'`
#sed '/<!--INSERTDEPENDENCIESHERE-->/c \
#$deps' xxx

echo "generating dojo package dependencies"
grep -rh --exclude=.svn -e "dojo.require(\"" -e "dojo.require('" -e dojo.provide $basePath/lib/ApstrataSDK $basePath/src/cms $basePath/src/home | sed 's/^\s*//g' | sed 's/\s*$//g' | sed 's/dojo.require(//g' | sed 's/dojo.provide(//g' | sed 's/).*$//g' | sed "s/\"/'/g" | sort | uniq | sed '/^$/d' | sed 's/$/,/g'  > $basePath/lib/dojo/util/buildscripts/apstratacms.build.tmp.sorted

# split the template profile and add the sorted list of dependencies
#	save to apstratacms.profile.js
echo "inserting dependencies in profile file"
csplit -ksf $basePath/lib/dojo/util/buildscripts/apstratacms.build.tmp.prefix. profiles/apstratacms.template.profile '/<!--INSERTDEPENDENCIESHERE-->/' '{*}'
csplit -ksf $basePath/lib/dojo/util/buildscripts/apstratacms.build.tmp.suffix. $basePath/lib/dojo/util/buildscripts/apstratacms.build.tmp.prefix.01 '/<!--INSERTDEPENDENCIESHERE-->/+1' '{*}'
cat $basePath/lib/dojo/util/buildscripts/apstratacms.build.tmp.prefix.00 $basePath/lib/dojo/util/buildscripts/apstratacms.build.tmp.sorted $basePath/lib/dojo/util/buildscripts/apstratacms.build.tmp.suffix.01 > profiles/apstratacms.profile.js

# clean up tmp files
echo "removing apstratacms.build.tmp files"
rm -f $basePath/lib/dojo/util/buildscripts/apstratacms.build.tmp.prefix.*
rm -f $basePath/lib/dojo/util/buildscripts/apstratacms.build.tmp.suffix.*
rm -f $basePath/lib/dojo/util/buildscripts/apstratacms.build.tmp.sorted
cp profiles/apstratacms.profile.js $basePath/lib/dojo/util/buildscripts/profiles

# backup the i18n.js file before playing around with it:
echo "backup dojo's i18n.js file - need to edit it before building"
i18njsfile=$basePath/lib/dojo/dojo/i18n.js
cp $i18njsfile `pwd`/i18n.js.tmp

# fix the dojo i18n.js file for nls bundle bug
echo "modifying dojo's i18n.js to add an nls fix..."
sed -i '/var bundle = dojo._loadedModules\[module\];/ i\
dojo.i18n._requireLocalization\(packageName,bundleName, locale\);' $i18njsfile

# run the dojo build...
echo "launching the dojo build process"
cd $basePath/lib/dojo/util/buildscripts
./build.sh profile=apstratacms action=clean,release optimize=shrinkSafe cssOptimize=comments.keepLines


# return the old i18n.js file
echo "return the dojo i18n.js file to its initial state"
cp `pwd`/i18n.js.tmp $i18njsfile

