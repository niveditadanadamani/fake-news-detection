import urllib.request, json, urllib.parse

def test_query(query):
    print(f"Testing query: {query}")
    url = f"https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch={urllib.parse.quote(query)}&prop=pageimages|extracts&exsentences=1&exintro=1&explaintext=1&pithumbsize=500&format=json"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            if 'query' in data and 'pages' in data['query']:
                pages = data['query']['pages']
                for pid in pages:
                    page = pages[pid]
                    if page.get('index') == 1:
                        print(f"  Title: {page.get('title')}")
                        print(f"  Thumbnail: {page.get('thumbnail', {}).get('source', 'NONE')}")
                        return
                print("  No index 1 page found")
            else:
                print("  No query/pages in response")
    except Exception as e:
        print(f"  Error: {e}")

test_query("Dhurandhar 2 movie")
test_query("Aliens in India")
test_query("The Moon")
