import urllib.request, json, urllib.parse

def test_query_refined(query):
    print(f"Testing query: {query}")
    url = f"https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch={urllib.parse.quote(query)}&prop=pageimages|extracts&exsentences=1&exintro=1&explaintext=1&pithumbsize=500&format=json"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            if 'query' in data and 'pages' in data['query']:
                pages = list(data['query']['pages'].values())
                pages.sort(key=lambda p: p.get('index', 999))
                
                image_hit = next((p for p in pages if 'thumbnail' in p), None)
                if image_hit:
                    print(f"  Found Image on Title: {image_hit.get('title')}")
                    print(f"  Thumbnail: {image_hit.get('thumbnail', {}).get('source')}")
                else:
                    print("  No page with thumbnail found among results.")
            else:
                print("  No query/pages in response")
    except Exception as e:
        print(f"  Error: {e}")

test_query_refined("Dhurandhar 2 movie")
test_query_refined("Aliens in India")
test_query_refined("The Moon")
test_query_refined("Global Warming")
