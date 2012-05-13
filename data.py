import cgi
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.api import memcache, urlfetch
import os
import logging
from google.appengine.ext import db

class DataRecord(db.Model):
    data       = db.TextProperty()
    count      = db.IntegerProperty()
    created_on = db.DateTimeProperty(auto_now_add = 1)

    def path(self):
        return "/data/" + str(self.key())

class Page(webapp.RequestHandler):

    def post(self):
        if not self.request.get('data'):
            logging.info('no data')
            self.response.set_status(404)
            self.response.out.write('no data')
            return

        record = DataRecord()
        record.data = db.Text(self.request.get('data'))
        record.count = 0
        record.put()
        logging.info('POST')
        logging.info(self.request.get('data'))
        logging.info(record.path())
        self.response.headers['Content-Type'] = "text/plain"
        self.response.out.write(record.key())

class GetPage(webapp.RequestHandler):
    def get(self, key):
        try:
            record = DataRecord.get(db.Key(key))
        except db.BadKeyError:
            record = None

        if not record:
            self.response.set_status(404)
            self.response.out.write('404')
            return

        self.response.headers['Content-Type'] = "text/plain"
        self.response.headers['X-Count'] = record.count if record.count else 0
        self.response.out.write(record.data)
        return

    def post(self, key):
        try:
            record = DataRecord.get(db.Key(key))
        except db.BadKeyError:
            record = None

        if not record:
            self.response.set_status(404)
            self.response.out.write('404')
            return

        count = record.count
        if not count:
            count = 0

        add = int(self.request.get('count')) if self.request.get('count') else 1

        count += add

        record.count = count
        record.put()

        self.response.headers['Content-Type'] = "text/plain"
        self.response.headers['X-Count'] = count if record.count else 0
        self.response.out.write(record.key())

application = webapp.WSGIApplication(
                                     [
                                      ('/data/', Page),
                                      ('/data/(.+)', GetPage),
                                     ],
                                     debug=True)

def main():
  run_wsgi_app(application)

if __name__ == "__main__":
  main()
