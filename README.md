# Pollgeni.us Documention
[Pollgeni.us](http://pollgeni.us) is an open source project built to exemplify the ease with which one can deploy a real-time [Node.js](https://nodejs.org/) server via [socket.io](http://socket.io/) with [Turner Logic's](http://tunerlogic.com) [WarpSpeed](https://warpspeed.io) platform.

Pollgeni.us is a simple polling platform that allows for the creation, distribution, and submission of custom polls. Users view polls and basic site statistics, such as total number of votes, polls, and active users, update in real time.

![Sample Screenshot](http://pollgeni.us/img/landing_page_screenshot.png)

This guide will help you get up and running with Node.js, socket.io and WarpSpeed.


## Vagrant Development Envrionment

This guide assumes that you are using the WarpSpeed Vagrant development environment. Doing so will help you follow best practices and keep your development and production environments as similar as possible. If you are not using WarpSpeed Vagrant, ignore the sections that involve using the VM.

## Fork and Clone the Sample Project
The best way to begin using this project is to fork the repository to your own GitHub account. This will allow you to make updates and begin using the project as a template for your own work. To fork the repository, simply click the "Fork" button for this repository.

Once you have forked the repository, you can clone it to your development environment or use pull-deploy to deploy it directly to a server configured with WarpSpeed.io.

Ideally, you should be using the WarpSpeed Vagrant development environment. The instructions below will assume this, although it isn't necessary if you already have a python environment set up.

To clone the repository to your local machine (not in your VM), use the following command:

```
# RUN THIS COMMAND FROM YOUR LOCAL ENVIRONMENT

cd ~/Sites
git clone git@github.com:YOUR_USERNAME/pollgeni.us.git pollgenius.dev
```

## Create a Database

Pollgeni.us uses a [MongoDB](https://www.mongodb.org/) document-oriented database. Mongo and its interactive shell come preinstalled on the Warpspeed Vagrant box. With some effort, the sample project can be configured with a traditional SQL database, however, Node.js web applications conventionally operate with NoSQL databases such as MongoDB. To access the Mongo interactive shell, run the following commands: 

```
# if you aren't already in your VM then...
# cd to your warpspeed-vagrant directory
# and ssh into your VM
cd ~/warpspeed-vagrant
vagrant ssh

# activate the Mongo interactive shell
mongo

# list all existing MongoDB databases
show dbs

# create a dedicated database
use polls_db

# create a dedicated collection
db.createCollection('polls')
```

This will create a database named "polls_db" with a collection, roughly equivalent to an SQL database's table, named 'polls', in which your Poll objects will be stored.

## Create a WarpSpeed Site

We need to create the appropriate server configuration files to run the site. To configure Nginx and Passenger to run your site, perform the following:

```
# if you aren't already in your VM then...
# cd to your warpspeed-vagrant directory
# and ssh into your VM
cd ~/warpspeed-vagrant
vagrant ssh

# then, run the site creation command
# notice that --force is used because the site directory already exists
warpspeed site:create node pollgenius.dev --force
```

## Install Dependencies

Node.js utilizes Node Package Manager (npm) to manage its dependencies. To install the required libraries listed in the `package.json`, run the following commands: 

```
# RUN THESE COMMANDS FROM YOUR VM

# cd to the project's root directory
cd ~/sites/pollgenius.dev

# install dependencies
npm install
```

## Create an .env.js file

```
# RUN THESE COMMANDS FROM YOUR VM

# cd to the project's root directory
cd ~/sites/pollgenius.dev

# create an .env.js file based on the provided template
cp env-template.js .env.js

# add an arbitrary secret session key
module.exports = {
	'RECAPTCHA_SECRET_KEY': '',
	'RECAPTCHA_SITE_KEY':'',
	'SESSION_SECRET': 'secret123'
};
```
## Add a Hosts File Entry

To access your new Node.js site, you will need to add an entry to your hosts file on your local machine (not your VM). To do so, perform the following:

```
# RUN THESE COMMANDS FROM YOUR LOCAL MACHINE

# open a terminal and run the following command (for Mac)
sudo nano /etc/hosts

# add this line to the end of the file
192.168.88.10 pollgenius.dev

# exit and save
```
Now, whenever you access "pollgeni.us" in the browser, you will be directed to your Node.js site within your VM.

## Register your domain with Google's reCAPTCHA
Point your browser to Google's [reCAPTCHA](https://www.google.com/recaptcha/intro/index.html) service and register your domain name.

Click Get reCAPTCHA and fill in the requisite fields as prompted. Ensure that the domain you register matches the domain name added to your hosts file entry.

![reCaptcha Register](http://pollgeni.us/img/register_domain_recaptcha.png)

Add the provided site and secret keys to the corresponding attributes in your .env.js file.

![reCaptcha Keys](http://pollgeni.us/img/recaptcha_keys.png)

## Restart your Site and Celebrate
Finally, we need to reload the site configuration to finalize and effectuate our changes. To do so, perform the following:

```
# RUN THESE COMMANDS FROM YOUR VM

# reload the site configuration
warpspeed site:reload pollgenius.dev
```

Now you can access http://pollgenius.dev on your local machine to view the site.

## Troubleshooting

If you have issues, chiefly a 500 Status Code Internal Error, and need to troubleshoot, view the NGINX error log for helpful clues.

```
# RUN THESE COMMANDS FROM YOUR VM

# open the NGINX error log
sudo nano /var/log/nginx/error.log

# ...or keep an open tab of the NGINX error log
sudo tail -f /var/log/nginx/error.log
```

# License
This sample project is open-sourced software licensed under the [MIT license](http://opensource.org/licenses/MIT).

