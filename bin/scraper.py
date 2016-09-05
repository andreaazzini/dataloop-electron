#!/usr/bin/env python

import csv
import subprocess
import sys

sys.path.insert(0, '../src')

from utils import cartesian, flatten, is_valid_query, pairwise


# Config

csv_folder = '../data/csv/'
twitter_config = '../config/twitterconfig.json'

# Get the hashtags for parties and topics

try:
    database_name = sys.argv[1]
    collection_name = sys.argv[2]
except:
    print 'You need to specify both a database_name and a collection_name'
    print 'Usage: scraper.py database_name collection_name'
    sys.exit()

party_hashtags = csv_folder + 'parties/' + database_name + '.csv'
topic_hashtags = csv_folder + 'topics/' + collection_name + '.csv'

with open(party_hashtags) as f:
    party_reader = csv.reader(f)
    parties = flatten(list(party_reader))

with open(topic_hashtags) as f:
    topic_reader = csv.reader(f)
    topics = flatten(list(topic_reader))


# Build the topic lists in order to fit them in the queries

def group_topics(parties, topics):
    topic_lists = []
    while topics:
        topic_list = []
        for t in topics:
            if is_valid_query(parties, topic_list + [t]):
                topic_list.append(t)
            else:
                topic_lists.append(topic_list)
                topics = list(set(topics) - set(topic_list))
                # print topics
                break
        if topic_list == topics:
            topic_lists.append(topic_list)
            break
    return topic_lists


# Build the Twitter queries

print 'Building and grouping Twitter queries...'

names = []
queries = []
for p1, p2 in pairwise(parties):
    party_list = [p1, p2]
    topic_lists = group_topics(party_list, topics)
    for topic_list in topic_lists:
        query_total = ''
        couples = cartesian([party_list, topic_list])
        for party, topic in couples:
            query = '((' + party + ' OR #' + party + ') (' + topic + ' OR #' + topic + '))'
            if not query_total:
                query_total = query
            else:
                query_total = query_total + ' OR ' + query
        names.append('#'.join(party_list + topic_list))
        queries.append(query_total)


# Launch the scraping processes

print 'Preparing to launch...'

commands = ''
for i, query in enumerate(queries):
    # scraper_command = 'twitter-scraper-cli -q ' + '"' + query + '" -T twitterconfig.json -d ' + db_name + ' -c ' + names[i]
    scraper_command = 'twitter-scraper-cli -q "' + query + '" -T ' + twitter_config + ' -d ' + database_name + ' -c ' + collection_name + '\n'
    if len(query) <= 500:
        # print 'Launching scraping process for query ' + query
        commands += scraper_command
        # subprocess.Popen(args)
    else:
        print 'WARNING: the query ' + query +' is too long!'

f = open('../config/commands', 'w')
f.write(commands)

print 'Launching...'
subprocess.call(["./series_scrape.sh"])
