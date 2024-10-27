#!/bin/bash

# Define the list as an array
list=("\\\"Far out in the"
"uncharted \\\backwaters/"
"of the we\$tern \$pir@al"
"arm of the \\\"galaxy\\\"...\\\"")

# Iterate through the list and generate Python print statements
for item in "${list[@]}"
do
  echo "print(\"$item\")"
done | python3