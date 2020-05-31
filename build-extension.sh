rm -rf extension-build-*
DIR_NAME=extension-build-`date +%s`
mkdir $DIR_NAME

npm run build
cp -r ./dist $DIR_NAME
cp extension-options* $DIR_NAME
cp manifest.json $DIR_NAME

echo built at $DIR_NAME