from django.utils.encoding import force_text
from rest_framework import status
from rest_framework.exceptions import APIException


class DuplicateValue(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Can't create a duplicate value."

    def __init__(self, detail, field="defail", status_code=None):
        if status_code is not None:
            self.status_code = status_code
        if detail is not None:
            self.detail = {field: force_text(detail)}
        else:
            self.detail = {"detail": force_text(self.default_detail)}


class ConflictingStates(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = "Conflicting state."

    def __init__(self, detail, field="detail", status_code=None):
        if status_code is not None:
            self.status_code = status_code
        if detail is not None:
            self.detail = {field: force_text(detail)}
        else:
            self.detail = {"detail": force_text(self.default_detail)}
