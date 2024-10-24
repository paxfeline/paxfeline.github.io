#!/bin/bash

# Define the list (using an array for easier handling of spaces and special characters)
list=("\\\"Far out in the" "uncharted \\\backwaters/" "of the we\$tern \$pir@al" "arm of the \\\"galaxy\\\"...\\\"")

# Iterate through the list
for item in "${list[@]}"; do
  echo "print(\"$item\")"  # Output the command to print each item
done | python