. devconsole.build.properties
cp -r $devconsolepath $apstratapath
cd $utilpath
./build.sh profileFile=$profilepath action=clean,release releaseName=