from numpy import genfromtxt
import json

raw_data = genfromtxt('KNMI_19931231.txt', delimiter=',', dtype=None)
formatted_data = []
size = len(raw_data)
for i in range(0, size):
    formatted_data.append([])
    datum = str(weer_data[i][1])
    datum = datum[:4] + '/' + datum[4:6] + '/' + datum[6:]
    temp = weer_data[i][2]
    formatted_data[i].append(datum)
    formatted_data[i].append(temp)
print json.dumps(formatted_data)
