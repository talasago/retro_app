from abc import ABCMeta, abstractmethod

from sqlalchemy.orm import Session


class RepositoryBase(metaclass=ABCMeta):
    @abstractmethod
    def __init__(self, db: Session):
        raise NotImplementedError

    def save(self, entity):
        raise NotImplementedError

    def find_all(self, conditions={}):
        raise NotImplementedError

    def find_one(self, conditions={}):
        raise NotImplementedError

    def delete(self, entity):
        raise NotImplementedError
