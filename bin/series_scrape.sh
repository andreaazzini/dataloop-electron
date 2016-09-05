#!/bin/bash

IFS=$"" queries=($(cat config/commands))
for i in $(seq ${#queries[*]}); do
    [[ ${queries[$i-1]} = $name ]]
done

for query in "${queries[@]}"
do
    echo "Launching one of the queries..."
    eval $query &
    wait
done

echo "All processes done!"
