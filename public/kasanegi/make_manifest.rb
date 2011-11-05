puts "CACHE MANIFEST"
puts "# #{Time.now.to_s}"
puts ""
puts "CACHE:"

`find .`.each_line{ |line|
  line = line.chomp.gsub(/^\./, '/kasanegi')
  next unless line =~ /\./
  next if line =~ /DS_Store/
  next if line =~ /rb$/
  next if line =~ /coffee$/
  next if line =~ /csv$/
  next if line =~ /html$/
  puts line
}
