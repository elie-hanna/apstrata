. devconsole.build.properties
mkdir $apstratapath/devConsole
cp -r $devconsolepath $apstratapath/devConsole
cd $utilpath
./build.sh profileFile=$profilepath action=clean,release releaseName=
