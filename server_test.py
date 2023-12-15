# This module tests the server to make sure it is working properly.

import requests

print("\nTesting data service... ", end="")

# Test hello world
response = requests.get("http://localhost:3000/")
assert response.status_code == 200
print("0 ", end="")

# Test basic user authentication
response = requests.get("http://localhost:3000/user", auth=("admin", "admin"))
assert response.status_code == 200
print("1 ", end="")

# Test getting a list of all phrases from user 1
response = requests.get("http://localhost:3000/user/1/phrase")
assert response.status_code == 200
print("2 ", end="")

# Test getting phrase 1 from user 1
response = requests.get("http://localhost:3000/user/1/phrase/1")
assert response.status_code == 200
print("3 ", end="")

print("OK!\n")
