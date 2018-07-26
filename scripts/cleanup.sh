#!/bin/bash

# Please run this script only in the project root folder.
#
# Usage
# ./scripts/cleanup.sh
#
# To delete node_modules folder:
# ./scripts/cleanup.sh all

rm -rf packages/**/dist/
rm -rf packages/**/dist-node/
rm -rf packages/**/dist-browser/
rm -rf packages/**/browsertest.build/
rm -rf packages/**/.nyc_output/
rm -rf packages/**/*.log

echo "Distribution, build and log files were deleted from all packages!"

if [ "$1" == "all" ]
	then
		rm -rf packages/**/node_modules/;
		echo "'node_modules' folders were deleted from all packages!"
fi;
