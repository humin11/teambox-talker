# Talker

## Installation

Install Twisted and Orbited by following instructions on http://orbited.org/wiki/Installation

Install RabbitMQ using MacPorts with:

    sudo port install rabbitmq-server

And an host entry in your /etc/hosts file for each subdomains you want to use:

    127.0.0.1       dev.com test.dev.com

Install required gems:
    
    gem sources -a http://gems.github.com # if not already done
    sudo gem install eventmachine uuid tmm1-amqp brianmario-yajl-ruby mysqlplus

## Running the app

Start the Rails app:

    thin start

Start Orbited:

    script/orbited

Start RabbitMQ:

    script/rabbitmq

Start the Talker server:

    script/talker

Browse to http://dev.com:3000/

# Twitter account
http://twitter.com/talkerapp
macournoyer+talker@gmail.com
kh2bi4JwMeRvMMkh