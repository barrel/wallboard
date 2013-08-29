Wallboard
=========

This is where the wallboard lives.

### Build Instructions
This project uses [Grunt](http://gruntjs.com) to automate build tasks.
- Install [Node.js](http://nodejs.org)
- Install grunt-cli: `npm install -g grunt-cli`
- Navigate to the project root directory
- Install dev dependencies: `npm install`
- Run `grunt` to compile, or `grunt server` to start a live development environment.

### Things You Should Note
- The backend lives in the [backdoor/](https://github.com/barrel/wallboard/blob/master/backdoor/) directory.
- Database backups are in the [backdoor/db-backups/](https://github.com/barrel/wallboard/blob/master/backdoor/db-backups/) directory.
- Change the database connection file to your configurations here: [con.php](https://github.com/barrel/wallboard/blob/master/con.php).
- Uploads go into the ```uploads``` directory (off root) which is not tracked on git.
