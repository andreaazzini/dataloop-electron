from itertools import izip, product

def flatten(l):
    return [item for sublist in l for item in sublist]

def pairwise(iterable):
    i = iter(iterable)
    return izip(i, i)

def cartesian(lists):
    return product(*lists)

def max_payload(n):
    return 504 - 21 * n

def payload_length(parties, topics):
    length_parties = 2 * sum([len(party) for party in parties])
    length_topics = 2 * sum([len(topic) for topic in topics])
    return len(topics) * length_parties + len(parties) * length_topics

def is_valid_query(parties, topics):
    return payload_length(parties, topics) <= max_payload(len(parties) * len(topics))
