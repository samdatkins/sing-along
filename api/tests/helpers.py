import datetime

from django.utils import timezone


def get_datetime_x_seconds_ago(seconds_ago):
    dt = datetime.datetime.now(tz=timezone.get_current_timezone())
    return dt - datetime.timedelta(seconds=seconds_ago)
