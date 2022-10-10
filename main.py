from objection_engine import render_comment_list
from objection_engine.beans.comment import Comment
import sys
import json

output_path = sys.argv[1]
comments = []

f = open(f'{output_path}.json', 'r', encoding="utf-8")
json_data = json.load(f)
for comment in json_data:
  comments.append(Comment(user_name=comment["user"], text_content=comment["text"]))

render_comment_list(comments, output_path + "-output.mp4", music_code="pwr", resolution_scale=2)
