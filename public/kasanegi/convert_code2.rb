# -*- coding: utf-8 -*-
require 'nokogiri'
require 'json'

data = Nokogiri open('primary_area.xml')

res = [ ]

data.search('pref').each{|pref|
  pref_name = pref.attr('title')
  pref.search('city').each{|city|
    city_name = city.attr('title')
    city_code = city.attr('id')
    res << {
      title: "#{pref_name} #{city_name}",
      city_code: city_code,
    }
  }
}

puts JSON.dump(res)
