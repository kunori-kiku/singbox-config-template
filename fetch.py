#!/usr/bin/env python3
"""
Module Name: fetch_config
This module provides functionality to fetch configuration data from specified
URLs. It retrieves the subscription information and, depending on the provided
command-line argument, optionally fetches additional endpoint data. The fetched data
is then merged and written out as a JSON configuration file ("config.json").
Functions:
    fetch(url: str) -> dict:
        Sends an HTTP GET request to the specified URL with a timeout of 10 seconds
        and returns the parsed JSON response.
    main():
        Entry point of the script that processes command-line arguments. It expects a
        single argument which determines whether endpoint data should be fetched along
        with the subscription data. The resultant configuration is then saved to a file.
Usage:
    Run the script as follows:
      python fetch.py <sub_type>
    Where <sub_type> should be either:
      - "no_endpoint": Fetch only the subscription configuration.
      - "with_endpoint": Fetch both the subscription and endpoint configurations.
"""

import json
import sys
import requests

SUB="https://your.subscription.url"
ENDPOINT="https://your.endpoint.url"
CONFIG_PATH="/etc/sing-box/config.json"


def fetch(url):
    response = requests.get(url, timeout=10)
    return response.json()

def main():
    if len(sys.argv) != 2:
        print("Usage: fetch.py <sub_type>")
        print("sub_type: no_endpoint or with_endpoint")
        sys.exit(1)
    sub_type = sys.argv[1]
    sub = fetch(SUB)
    if sub_type != "no_endpoint":
        endpoint = fetch(ENDPOINT)
        sub["endpoint"] = endpoint
    with open(CONFIG_PATH, "w", encoding="utf-8") as f:
        json.dump(sub, f)

if __name__ == "__main__":
    main()