require File.dirname(__FILE__) + "/../spec_helper"

describe Feed do
  use_vcr_cassette "feeds", :record => :new_episodes

  describe "class methods" do
    describe "#find_available" do
      it 'finds available feeds' do
        feed = Factory(:feed, :run_at => 1.minute.ago)
        unavailable_feed = Factory(:feed, :run_at => 10.minutes.since)
        Feed.find_available(5).should include(feed)
        Feed.find_available(5).should_not include(unavailable_feed)
      end
    end
   
    describe "#work" do
      it 'runs a number of jobs and returns successes and failures' do
        feeds = []
        feeds << mock_model(Feed, :run_with_lock => true)
        feeds << mock_model(Feed, :run_with_lock => true)

        Feed.stub(:find_available).and_return(feeds, [feeds[1]], [])
        Feed.work.should == [2,0]
      end
      context "in case the job raises any error" do
        it "treats it as a failure" do
          feed = Factory(:feed)
          feed.should_receive(:perform).once.and_raise(ArgumentError)

          Feed.stub(:find_available).and_return([feed], [])
          success, failure = Feed.work
          success.should == 0
          failure.should == 1
        end
      end
    end
  end
 
  describe "instance methods" do
    describe "#url" do
      it 'returns a nice parsed URL' do
        Feed.create(:url => "feed:https://github.com/feeds/macournoyer/commits/talker/master").url.should == "https://github.com/feeds/macournoyer/commits/talker/master"
        Feed.create(:url => "feed://search.twitter.com/search.atom?q=Avatar").url.should == "http://search.twitter.com/search.atom?q=Avatar"
      end
    end

    describe "#run_with_lock" do
      it 'calls perform on the feed' do
        feed = Factory(:feed)
        feed.should_receive(:perform).once
        feed.run_with_lock.should be_true
        feed.failed_at.should == nil
        feed.last_error.should == nil
        feed.locked_at.should == nil
      end
      context "in case perform raises any error" do
        it 'populates failed_at and last_error fields' do
          feed = Factory(:feed)
          feed.should_receive(:perform).and_raise(ArgumentError)
          feed.run_with_lock.should be_false
          feed.failed_at.should be_kind_of(Time)
          feed.last_error.should == "ArgumentError"
        end
      end
    end
    describe "#perform" do
      it "publishes as many messages as there are in the feed" do
        feed = Factory(:feed)
        feed.room.should_receive(:send_message).exactly(3).times
        feed.perform
        
        feed.last_modified_at.should == DateTime.parse("Sun, 25 Apr 2010 14:36:41 UTC +00:00")
        feed.etag.should be_nil
      end

      it "only publishes new entries" do
        feed = Factory(:feed)
        feed.update_attribute :last_modified_at, DateTime.parse("Sun, 25 Apr 2010 14:36:41 UTC +00:00") - 1.hour
        feed.room.should_receive(:send_message).once.with("Why Mark Suster is wrong about not hiring job hoppers", anything)
        feed.perform
      end

      it "does not publish empty feeds" do
        feed = Factory(:feed)
        feed.should_receive(:open_feed).and_return(FeedNormalizer::FeedNormalizer.parse(open("spec/fixtures/feeds/empty.xml")))
        feed.room.should_not_receive(:send_message)
        feed.perform
      end
      context "when the feed parser returns an error code, such as 304" do
        it "does not publish anything" do
          feed = Factory(:feed)
          FeedNormalizer::FeedNormalizer.should_receive(:parse).and_return(304)
          feed.room.should_not_receive(:send_message)
          feed.run_with_lock
          
          feed.last_modified_at.should be_nil
        end
      end
      context "when the feed parser returns nil" do
        it "does not publish anything" do
          feed = Factory(:feed)
          FeedNormalizer::FeedNormalizer.should_receive(:parse).and_return nil
          feed.room.should_not_receive(:send_message)
          feed.run_with_lock
          
          feed.last_modified_at.should be_nil
          feed.last_error.should_not be_nil
        end
      end
    end
  end

end
