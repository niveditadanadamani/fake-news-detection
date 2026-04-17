import urllib.request, json, urllib.parse

def test_page_detail(title):
    print(f"Testing detail for: {title}")
    url = f"https://en.wikipedia.org/w/api.php?action=query&titles={urllib.parse.quote(title)}&prop=pageimages|images&piprop=original|thumbnail&pithumbsize=500&format=json"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            print(json.dumps(data, indent=2))
    except Exception as e:
        print(f"  Error: {e}")

test_page_detail("KGF: Chapter 2")
