import urllib.request, json, urllib.parse, re

cases = [
    "Dhurandhar 2 movie has been released in theatres worldwide.",
    "Aliens landed in India yesterday",
    "https://example.com/news",
    "Global warming is accelerating",
    "The moon is made of cheese",
    "Water boils at 100 degrees Celsius",
    "Elon Musk bought Twitter"
]

for query in cases:
    url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(query)}&utf8=&format=json"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            print(f"Query: {query}")
            if len(data['query']['search']) > 0:
                title = data['query']['search'][0]['title'].lower()
                query_words = [w.lower() for w in re.findall(r'\b\w+\b', query) if len(w) > 3]
                
                match = any(w in title for w in query_words)
                print(f"First hit: {title}")
                print(f"Words: {query_words}")
                print(f"Match (Real?): {match}\n")
            else:
                 print("No hits (Fake)\n")
    except Exception as e:
        print(e)
