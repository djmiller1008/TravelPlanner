FROM python:3.9-alpine

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN apk update \
&& apk add postgresql-dev gcc python3-dev musl-dev \
&& apk add --no-cache --virtual .build-deps build-base linux-headers

COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install dj_database_url
RUN pip install whitenoise

COPY . . 

COPY ./entrypoint.sh /
ENTRYPOINT [ "sh", "/entrypoint.sh" ]

