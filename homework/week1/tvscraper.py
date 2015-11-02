#!/usr/bin/env python
# Name: Willem Bruin
# Student number: 10209735
'''
This script scrapes IMDB and outputs a CSV file with highest ranking tv series.
'''
# IF YOU WANT TO TEST YOUR ATTEMPT, RUN THE test-tvscraper.py SCRIPT.
import csv

from pattern.web import URL, DOM, plaintext

TARGET_URL = "http://www.imdb.com/search/title?num_votes=5000,&sort=user_rating,desc&start=1&title_type=tv_series"
BACKUP_HTML = 'tvseries.html'
OUTPUT_CSV = 'tvseries.csv'

def extract_tvseries(dom):
    '''
    Extract a list of highest ranking TV series from DOM (of IMDB page).

    Each TV series entry should contain the following fields:
    - TV Title
    - Ranking
    - Genres (comma separated if more than one)
    - Actors/actresses (comma separated if more than one)
    - Runtime (only a number!)
    '''

    # ADD YOUR CODE HERE TO EXTRACT THE ABOVE INFORMATION ABOUT THE
    # HIGHEST RANKING TV-SERIES
    # NOTE: FOR THIS EXERCISE YOU ARE ALLOWED (BUT NOT REQUIRED) TO IGNORE
    # UNICODE CHARACTERS AND SIMPLY LEAVE THEM OUT OF THE OUTPUT.

    # initialize empty list to store data from html
    series_output = []
    # select only DOM main containing table
    selection = dom.by_id("main")
    # iterate through table row elements
    for tr in selection.by_tag("tr"):
        # iterate through series
        for row in tr.by_tag("td.title"):
            line = []
            # append each series metadata to line
            for title in row.by_tag("a")[:1]:
                line.append(title.content)
            for ranking in row.by_class("value"):
                line.append(ranking.content)
            for genre_list in row.by_class("genre"):
                genre_count = 0
                genre_line = ''
                genre_length = len(genre_list.by_tag("a"))
                # iterate through list containing different elements
                for genre in genre_list.by_tag("a"):
                    # append each element in unicode string
                    genre_line += genre.content.encode('utf-8')
                    # add commas between elements
                    genre_count += 1
                    if genre_count != genre_length and genre_length > 1:
                        genre_line += ', '
                line.append(genre_line)
            for actor_list in row.by_class("credit"):
                actor_count = 0
                actor_line = ''
                actor_length = len(actor_list.by_tag("a"))
                for actor in actor_list.by_tag("a"):
                    actor_line += actor.content.encode('utf-8')
                    actor_count += 1
                    if actor_count != actor_length and actor_length > 1:
                        actor_line += ', '
                line.append(actor_line)
            for runtime in row.by_class("runtime"):
                # extract numbers only
                time = [int(s) for s in runtime.content.split() if s.isdigit()]
                if len(time) > 0:
                    line.append(time[0])
                else:
                    line.append('Unknown')
            # store current series metadata in output list
            series_output.append(line)

    return series_output  # replace this line as well as appropriate

def save_csv(f, tvseries):
    '''
    Output a CSV file containing highest ranking TV-series.
    '''
    writer = csv.writer(f)
    writer.writerow(['Title', 'Ranking', 'Genre', 'Actors', 'Runtime'])

    # ADD SOME CODE OF YOURSELF HERE TO WRITE THE TV-SERIES TO DISK
    for row in tvseries:
        writer.writerow(row)

if __name__ == '__main__':
    # Download the HTML file
    url = URL(TARGET_URL)
    html = url.download()

    # Save a copy to disk in the current directory, this serves as an backup
    # of the original HTML, will be used in testing / grading.
    with open(BACKUP_HTML, 'wb') as f:
        f.write(html)

    # Parse the HTML file into a DOM representation
    dom = DOM(html)

    # Extract the tv series (using the function you implemented)
    tvseries = extract_tvseries(dom)

    # Write the CSV file to disk (including a header)
    with open(OUTPUT_CSV, 'wb') as output_file:
        save_csv(output_file, tvseries)