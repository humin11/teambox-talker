module Talker
  module Logger
    class Room
      attr_reader :name
      
      def initialize(name, server)
        @name = name
        @server = server
        reset
      end
      
      def reset
        @parser = Yajl::Parser.new
        @parser.on_parse_complete = method(:received)
      end
      
      def parse(data)
        @parser << data
      rescue Yajl::ParseError => e
        Talker.logger.warn "Ignoring invalid JSON (room##{@name}): " + e.message
        reset
      end
      
      def callback(&callback)
        @callback = callback
      end
      
      def received(event)
        type = event["type"]
        
        unless event.key?("user") || event.key?("user")
          Talker::Notifier.error "No user key in event: #{event.inspect}"
          return
        end
        
        Talker.logger.debug{"room##{@name}> " + event.inspect}
        
        Talker.storage.insert_event @name, event, @callback
      end
    end
  end
end