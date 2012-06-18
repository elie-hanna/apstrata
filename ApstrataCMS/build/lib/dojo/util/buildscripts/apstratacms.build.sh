#!/bin/bash

basePath=../../../..

# This should be located in your dojo/util/buildscripts folder
# You must have the dojo build profile template file: /profiles/apstratacms.template.profile
# delete the old release folder
echo "deleting the old dojo release folder"
rm -rf ../../release/

# clear out any old tmp/output files that might still be here
echo "removing apstratacms.build.tmp files"
rm -f apstratacms.build.tmp.prefix.*
rm -f apstratacms.build.tmp.suffix.*
rm -f apstratacms.build.tmp.sorted

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
grep -rh --exclude=.svn -e "dojo.require(\"" -e "dojo.require('" -e dojo.provide $basePath/lib/ApstrataSDK $basePath/src/cms $basePath/src/home | sed 's/^\s*//g' | sed 's/\s*$//g' | sed 's/dojo.require(//g' | sed 's/dojo.provide(//g' | sed 's/).*$//g' | sed "s/\"/'/g" | sort | uniq | sed '/^$/d' | sed 's/$/,/g'  > apstratacms.build.tmp.sorted

# split the template profile and add the sorted list of dependencies
#	save to apstratacms.profile.js
echo "inserting dependencies in profile file"
csplit -ksf apstratacms.build.tmp.prefix. profiles/apstratacms.template.profile '/<!--INSERTDEPENDENCIESHERE-->/' '{*}'
csplit -ksf apstratacms.build.tmp.suffix. apstratacms.build.tmp.prefix.01 '/<!--INSERTDEPENDENCIESHERE-->/+1' '{*}'
cat apstratacms.build.tmp.prefix.00 apstratacms.build.tmp.sorted apstratacms.build.tmp.suffix.01 > profiles/apstratacms.profile.js

# clean up tmp files
echo "removing apstratacms.build.tmp files"
rm -f apstratacms.build.tmp.prefix.*
rm -f apstratacms.build.tmp.suffix.*
rm -f apstratacms.build.tmp.sorted

# run the dojo build...
echo "launching the dojo build process"
./build.sh profile=apstratacms action=clean,release optimize=shrinkSafe cssOptimize=comments.keepLines


cp $basePath/templates/min/parts/head-packaged.php $basePath/templates/min/parts/head.php 
