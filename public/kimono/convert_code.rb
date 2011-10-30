# -*- coding: utf-8 -*-
data = open('state_code.csv').read

res = { }

data.each_line.to_a[1..-1].each{ |line|
  line.chomp!
  # "5310,24,1,三重県,北中部,津"
  (code, state_code, is_primary, state_name, area_name, capital_name) = *(line.split(/,/))

  res[state_code.to_i] ||= []
  res[state_code.to_i] << {
    code: code.to_i,
    state_code: state_code.to_i,
    is_primary: is_primary == "1",
    state_name: state_name,
    area_name: area_name,
    capital_name: capital_name,
  }
}

require 'json'

puts JSON.dump(res)
