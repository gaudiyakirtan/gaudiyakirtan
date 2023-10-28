import json
import os

songs = json.load(open('_list.json'))
song_filenames = os.listdir('.')

with open('_requireFile.ts', 'w') as f:
    f.write('const songs = {\n')
    for song in songs:
        if song['uid'] + '.json' not in song_filenames:
            continue
        uid = song['uid']
        f.write(f'    "{uid}": require("app/assets/songs/{uid}.json"),\n')
    f.write('};\n')
    f.write('export default songs;\n')
