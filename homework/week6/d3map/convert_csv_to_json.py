import csv
import json

csvfile = open('worldpopdens.csv', 'r')
jsonfile = open('data.json', 'w')

fieldnames = ("name", "pop_dens", "area", "total_pop")
reader = csv.DictReader( csvfile, fieldnames)
output = json.dumps( [ row for row in reader ] )
jsonfile.write(output)