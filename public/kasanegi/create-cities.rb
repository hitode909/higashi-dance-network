require 'open-uri'
require 'json'

csv = open('https://gist.githubusercontent.com/ctsaran/42728dad3c7d8bd91f1d/raw/017718dde64f70e221f0e2bb0487a6c975d6195d/gistfile1.txt').read
puts JSON.pretty_generate(csv.each_line.map{|line|
  (number, name, lat, lon) = * line.chomp.split(/\t/)
  {
    name: name,
    lat: lat.to_f,
    lon: lon.to_f,
  }
})