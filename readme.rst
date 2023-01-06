elections21-governors
======================================================

This news app is built on our `interactive template <https://github.com/nprapps/interactive-template>`_. Check the readme for that template for more details about the structure and mechanics of the app, as well as how to start your own project.

Getting started
---------------

To run this project you will need:

* Node installed (preferably with NVM or another version manager)
* The Grunt CLI (install globally with ``npm i -g grunt-cli``)
* Git

With those installed, you can then set the project up using your terminal:

#. Pull the code - ``git clone git@github.com:nprapps/elections21-governors``
#. Enter the project folder - ``cd elections21-governors``
#. Install dependencies from NPM - ``npm install``
#. Make sure sheets and docs are up to date - ``grunt sheets docs``
#. Start the server - ``grunt``

This project is meant to only generate embeds--there is no 'index' page, so localhost:8000/ will be blank. Instead, go to /customizer.html, which shows
the URLs of the embedded bits. 

Running tasks
-------------

Like all interactive-template projects, this application uses the Grunt task runner to handle various build steps and deployment processes. To see all tasks available, run ``grunt --help``. ``grunt`` by itself will run the "default" task, which processes data and starts the development server. However, you can also specify a list of steps as arguments to Grunt, and it will run those in sequence. For example, you can just update the JavaScript and CSS assets in the build folder by using ``grunt bundle less``.

Common tasks that you may want to run include:

* ``sheets`` - updates local data from Google Sheets
* ``docs`` - updates local data from Google Docs
* ``google-auth`` - authenticates your account against Google for private files
* ``static`` - rebuilds files but doesn't start the dev server
* ``cron`` - runs builds and deploys on a timer (see ``tasks/cron.js`` for details)
* ``publish`` - uploads files to the staging S3 bucket

  * ``publish:live`` uploads to production
  * ``publish:simulated`` does a dry run of uploaded files and their compressed sizes

Tracked events
--------------

* ``route`` - sends the URL fragment as the event label
* ``county-metric`` - the county table's custom metric was updated
* ``county-sort`` - the user clicked a header to re-sort a county table
* ``clicked-bubble`` - the user clicked a bubble on the margin plot
* ``clicked-cartogram`` - the user clicked a state on the cartogram
* ``clicked-map`` - the user clicked a state on the national map
* ``tab-selected`` - the user manually chose a tab to view

Getting County Data
--------------

Pulling county unemployment and census data relies on several python scripts, in the root directoy. 
* ``get_unemployment_data.py`` - Pulls unemployment data from the U.S. Bureau of Labor Statistics. To run, it you must pass in the year you wish to pull in the format of '19' for '2019' etc.
* ``get_census_data.py`` - Uses the censusdata package to pull population, race, and employment data from the census, maps them to human-readable names, and calculates some percentages. Before running in a new year, check the detail and subject table codes are still correct, as the census changes these occasionally. 

For 2020, Covid case numbers were added. If these numbers are no longer relevant, covid will need to be removed from availableMetrics in the util.

Additional links and params
--------------

* Homepage embed: ``/homepage.html``
   
  * ``display=margins,cartogram,map`` controls which viz displays on load
   
* Balance of Power embed (House and Senate bars): ``/embedBOP.html``

  * ``president=true`` adds electoral totals to the top (for use on homepage)
  * ``hideCongress=true`` hides House and Senate bars on mobile view
  * ``onlyPresident=true`` hides House and Senate bars on all views
  * ``inline=true`` for side-by-side display (for use on liveblog)
  * ``theme=dark`` for dark theme
    
* Internal ballot initiative board: ``/#/ballots``
* Results embed customizer: ``/customizer.html``
* Share pages, with metadata for social cards

  * ``/share/XX.html`` - state pages, where XX is the postal code
  * ``/share/president.html`` - Presidential big board
  * ``/share/senate.html`` - Senate big board
  * ``/share/house.html`` - House big board
  * ``/share/governor.html`` - Governors big board

Troubleshooting
---------------

**Fatal error: Port 35729 is already in use by another process.**

The live reload port is shared between this and other applications. If you're running another interactive-template project or Dailygraphics Next, they may collide. If that's the case, use ``--reload-port=XXXXX`` to set a different port for the live reload server. You can also specify a port for the webserver with ``--port=XXXX``, although the app will automatically find the first available port after 8000 for you.
