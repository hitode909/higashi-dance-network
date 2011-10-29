import cgi
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.api import memcache, urlfetch, images
import os
import logging
from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from google.appengine.ext.webapp import template
import urllib
import base64
from django.utils import simplejson

class ProxyPage(webapp.RequestHandler):
    def fetch_resource(self, uri):
        resource = urlfetch.fetch(uri)
        headers = {}
        for key in resource.headers.keys(): headers[key] = resource.headers[key]

        return {"content": resource.content, "status_code": resource.status_code, "headers": headers}

    def get(self, path):
        path = urllib.unquote(path)
        resource = self.fetch_resource(path)
        for k, v in resource["headers"].iteritems():
            self.response.headers[k] = v
        self.response.out.write(resource["content"])

application = webapp.WSGIApplication(
                                     [
                                      ('/proxy/(.*)', ProxyPage),
                                     ],
                                     debug=True)

def main():
  run_wsgi_app(application)

if __name__ == "__main__":
  main()
