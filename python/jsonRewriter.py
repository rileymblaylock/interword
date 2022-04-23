import json
import random

def clean_files():
    targetWords = open('src/app/util/targetWords.json')
    dictionary = open('src/app/util/dictionary.json')

    data = json.load(targetWords)

    #remove all a and z words from target words
    data = [x for x in data if not x.startswith('z')]
    data = [x for x in data if not x.startswith('a')]

    json_obj = json.dumps(data, indent = 4)

    with open('src/app/util/targetWordsClean.json', 'w') as out:
        out.write(json_obj)

    targetWords.close()

    dict_json = json.load(dictionary)
    lookup = {}

    for word in dict_json:
        if word[0] in lookup:
            lookup[word[0]].append(word)
        else:
            lookup[word[0]] = [ word ]

    lookup = json.dumps(lookup, indent = 4)

    with open('src/app/util/dictionaryClean.json', 'w') as out:
        out.write(lookup)

    dictionary.close()

def set_target_words():
    targetWords = open('src/app/util/targetWordsClean.json')
    dictionary = open('src/app/util/dictionaryClean.json')

    targetWords = json.load(targetWords)
    dictionary = json.load(dictionary)

    newWords = []

    for word in targetWords:
        if word[0] == 'b':
            rand_top_num = 1
        elif word[0] == 'c':
            rand_top_num = random.randint(1, 2)
        else:
            rand_top_num = random.randint(1, 3)

        if word[0] == 'y':
            rand_bottom_num = 1
        elif word[0] == 'x':
            rand_bottom_num = random.randint(1, 2)
        else:
            rand_bottom_num = random.randint(1, 3)
        
        top_letter = chr(ord(word[0]) - rand_top_num)
        bottom_letter = chr(ord(word[0]) + rand_bottom_num)

        top_word = random.choice(dictionary[top_letter])
        bottom_word = random.choice(dictionary[bottom_letter])
        newWords.append([word, top_word, bottom_word])
    
    newTargetWordJSON = json.dumps(newWords, indent = 4)
    with open('src/app/util/targetWordsClean2.json', 'w') as out:
        out.write(newTargetWordJSON)

clean_files()
set_target_words()

