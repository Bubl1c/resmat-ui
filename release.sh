#!/usr/bin/env bash
set -e
CERT=${1}
REMOTE_HOST=${2}
REMOTE_USER=${3}
if [ "${4}" == "reload_libs" ]; then
  RELOAD_LIBS=true
else
  RELOAD_LIBS=false
fi

if [ "${5}" == "reload_configs" ]; then
  RELOAD_CONFIGS=true
else
  RELOAD_CONFIGS=false
fi

echo =====================================
echo Releasing to ${REMOTE_USER}@${REMOTE_HOST}. Cert: ${CERT}
echo Reload libs = ${RELOAD_LIBS}
echo Reload configs = ${RELOAD_CONFIGS}
echo =====================================

read -p "Press enter to continue"

REMOTE_FOLDER="~/hosted"

DIST_FOLDER="dist"
FILES=(
  "favicon.ico"
  "index.html"
  "inline.bundle.js"
  "inline.bundle.js.map"
  "main.bundle.js"
  "main.bundle.js.map"
  "styles.bundle.js"
  "styles.bundle.js.map"
  "vendor.bundle.js"
  "vendor.bundle.js.map"
)

RESOURCES=("img")

function runSSH {
    COMMAND_TO_RUN="${1}"
    ssh -i ${CERT} ${REMOTE_USER}@${REMOTE_HOST} ${COMMAND_TO_RUN}
}

function scpToRemote {
  LOCAL_FILE=${1}
  REMOTE_FOLDER_TO_PLACE_FILE=${2}
  SCP_OPTS=${3}
  scp -i ${CERT} ${SCP_OPTS} ${LOCAL_FILE} ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_FOLDER_TO_PLACE_FILE}
}

function prepare {
  if [ ${RELOAD_LIBS} = true ]; then
    echo "Cleaning LIBS in ${REMOTE_FOLDER}"
    runSSH "rm -rf lib"
  fi

  if [ ${RELOAD_CONFIGS} = true ]; then
    echo "Cleaning CONFIGS in ${REMOTE_FOLDER}"
    runSSH "rm -rf config"
  fi

  echo "Cleaning RESOURCES in ${REMOTE_FOLDER}"
    for i in ${RESOURCES[@]}; do
      runSSH "rm -rf ${i}"
    done

  echo "Cleaning DIST files in ${REMOTE_FOLDER}"
  for i in ${FILES[@]}; do
    runSSH "rm -f ${REMOTE_FOLDER}/${i}"
  done
}

function zipAndSendLibs {
  mkdir -p "tmp"
  zip -r "tmp/lib" lib
  scpToRemote "tmp/lib.zip" ${REMOTE_FOLDER}
  runSSH "unzip ~/hosted/lib.zip"
  runSSH "rm -f ~/hosted/lib.zip"
}

#Prerequicities
runSSH "mkdir -p ${REMOTE_FOLDER}"

prepare

echo Copying dist files into ${REMOTE_FOLDER}
for i in ${FILES[@]}; do
  scpToRemote ${DIST_FOLDER}/${i} ${REMOTE_FOLDER}
done

for i in ${RESOURCES[@]}; do
  scpToRemote ${i} ${REMOTE_FOLDER} "-r"
done

if [ ${RELOAD_LIBS} = true ]; then
  zipAndSendLibs
fi

if [ ${RELOAD_CONFIGS} = true ]; then
  scpToRemote "config" ${REMOTE_FOLDER} "-r"
fi

exit
