from api.models import Song


def try_db(tries=10):
    file1 = open("songs.tsv", "r")
    lines = file1.readlines()

    for line in lines[0:tries]:
        split_line = line.replace("\\r", "\r").replace("\\n", "\n").split("\t")
        Song.objects.create(
            artist=split_line[1][0:40],
            title=split_line[2][0:40],
            url=split_line[3],
            content=split_line[4],
        )
