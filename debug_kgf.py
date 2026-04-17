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
                
                print(f"  Total pages returned: {len(pages)}")
                for p in pages[:3]:
                    print(f"    Page: {p.get('title')}, Thumbnail: {'YES' if 'thumbnail' in p else 'NO'}")
                
                image_hit = next((p for p in pages if 'thumbnail' in p), None)
                if image_hit:
                    print(f"  Selected Image on Title: {image_hit.get('title')}")
                else:
                    print("  No page with thumbnail found.")
            else:
                print("  No query/pages in response")
    except Exception as e:
        print(f"  Error: {e}")

test_query_refined("K.G.F 2 movie")
test_query_refined("KGF 2")
