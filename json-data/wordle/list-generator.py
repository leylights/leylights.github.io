import json

inFile = open("extract.txt", "rt")
outFile = open("words.json", "wt")

words = []

for line in inFile:
    words.append(line.split()[2])

words.sort()

outFile.write(json.dumps(words))

# outFile.write("{ words: [")

# for w in words:
#     outFile.write("\"" + w + "\",\n")

# outFile.write("] }")

inFile.close()
outFile.close()
