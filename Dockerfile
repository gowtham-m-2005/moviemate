FROM ubuntu:latest
LABEL authors="gowth"

ENTRYPOINT ["top", "-b"]