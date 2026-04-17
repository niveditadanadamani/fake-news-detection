import urllib.request, json, urllib.parse

query = "Aliens landed in India yesterday"
url = f"https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch={urllib.parse.quote(query)}&prop=pageimages|extracts&exsentences=1&exintro=1&explaintext=1&pithumbsize=500&format=json"

try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        print(json.dumps(data, indent=2))
except Exception as e:
    print(e)
