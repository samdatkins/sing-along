import json
from channels.generic.websocket import WebsocketConsumer
from enum import Enum


class MessageTypes(str, Enum):
    GETSONG = "getSong"

    def __str__(self) -> str:
        return str.__str__(self)


class SingalongConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()

    def disconnect(self, close_code):
        pass

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        if text_data_json["type"] == MessageTypes.GETSONG:
            self.send(text_data=json.dumps({"song": "Here is a fake song"}))
        else:
            self.send(text_data=json.dumps({"message": "Unknown request type"}))
