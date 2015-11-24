import csv
import json

csvfile = open('populationdensityEU.csv', 'r')
jsonfile = open('populationdensityEU.json', 'w')

fieldnames = ("name", "pop_dens", "area", "total_pop")
reader = csv.DictReader( csvfile, fieldnames)
output = json.dumps( [ row for row in reader ] )
jsonfile.write(output)