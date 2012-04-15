import cgi
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext import webapp

class KasanegiRedirectPage(webapp.RequestHandler):

    def get(self):
        self.redirect("/kasanegi/")

class IromiruRedirectPage(webapp.RequestHandler):

    def get(self):
        self.redirect("/iromiru/")

application = webapp.WSGIApplication(
                                     [
                                      ('/kasanegi', KasanegiRedirectPage),
                                      ('/iromiru', IromiruRedirectPage),
                                     ],
                                     debug=True)

def main():
  run_wsgi_app(application)

if __name__ == "__main__":
  main()
