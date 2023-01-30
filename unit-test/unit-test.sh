#!/bin/bash

#
#	This script MUST be launch from the root directory
#	of the repository with the command `make test`.
#

TESTER_PATH="unit-test/"

Blue='\033[0;34m'
Purple='\033[0;35m'
Cyan='\033[0;36m'
BYellow='\033[1;33m'
white='\033[1;37m'
green='\033[0;32m'
red='\033[0;31m'
yell='\033[0;33m'
reset='\033[0m'

if [ "${PWD##*/}" == "unit-test" ]; then
	printf "${red}Error:${white} This script must be launch from the makefile in the root directory using the command \`make test\`.${reset}"
	exit 1
fi

echo
printf "${yell}---------------------------${reset}\n"
printf "${yell}|Transcendance unit-tester|${reset}\n"
printf "${yell}---------------------------${reset}\n"
echo

errors=0
files=`ls ./${TESTER_PATH}scripts`
files=`echo $files | sed 's/\n/ /g'`
for file in $files
do
	printf "${Purple}$file:${reset}\n"
	ret=`bash ./${TESTER_PATH}scripts/$file`
	status=$?
	if [ $status != 0 ]; then
		errors=$(($errors+1))
		printf "${Blue}Result:${reset} ❌\n"
	else
		printf "${Blue}Result:${reset} ✅\n"
	fi
	echo
done
if [ $errors == 0 ]; then
	printf "${Purple}Number of errors: ${green}${errors}${reset}\n\n"
	exit 0
else
	printf "${Purple}Number of errors: ${red}${errors}${reset}\n\n"
	exit 1
fi
