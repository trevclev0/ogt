#Online Group Therapy
##Getting Started
###Node.js
	bash
	sudo apt-get update
	sudo apt-get install -y python-software-properties python g++ make
	sudo add-apt-repository -y ppa:chris-lea/node.js
	sudo apt-get update
	sudo apt-get install nodejs
###Imagemagick and pdftk
	bash
	sudo apt-get install imagemagick pdftk
###Node Dependencies
	bash
	# navigate to folder location
	cd ~/online-therapy
	npm install
##Ignoring npm_modules Directory
By not including this directory, the repository is some 300MB smaller.

Create a .gitignore file just inside the repository.

The file should contain the following:

	node_modules/
	
##Viewing the Database Structure
Plug the DBDesign.xml into [this site](http://ondras.zarovi.cz/sql/demo/ "SQL Designer") to see the structure. 

If making any change to the database structure, make sure of the following:

1. Any fields you add do not have a default value unless you mean it.
2. Any fields you add can not be NULL (checkbox).

##Configuring the Database
Look at the DBInfo.json for the database information to use.

1. Create a MySQL database called "ogt" (CREATE DATABASE ogt;)
2. Create a user named "ogt" and set that user's password to be the password specified in DBInfo.json. (CREATE USER 'ogt'@'localhost' IDENTIFIED BY 'password';)
3. Grant SELECT, DELETE, UPDATE, and INSERT privileges to the ogt user. (GRANT SELECT, DELETE, UPDATE, INSERT ON ogt . * TO 'ogt'@'localhost';)
4. Import the schema into the Database. ($ mysql -u root -p ogt < schema.sql) (Will be prompted for password)